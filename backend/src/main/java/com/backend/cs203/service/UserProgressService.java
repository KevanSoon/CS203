package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.progress.ChapterProgressDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.User;
import com.backend.cs203.entity.UserCardProgress;
import com.backend.cs203.entity.UserLessonProgress;
import com.backend.cs203.entity.UserLessonProgress.ProgressStatus;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.QuizResultRepository;
import com.backend.cs203.repository.UserCardProgressRepository;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserProgressService {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CardRepository cardRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final UserCardProgressRepository userCardProgressRepository;

    /**
     * Get all lessons with progress for a user's dashboard.
     * Ordered: in_progress first (by last_accessed_at DESC),
     *          then not_started,
     *          then completed (by completed_at DESC).
     */
    public List<LessonProgressDTO> getDashboard(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        // Get all approved lessons
        List<Lesson> allLessons = lessonRepository.findAll().stream()
            .filter(l -> l.getStatus() == Lesson.LessonStatus.approved && l.getDeletedAt() == null)
            .toList();

        // Get user's lesson progress rows
        Map<Integer, UserLessonProgress> progressMap = userLessonProgressRepository
            .findByUserId(userId).stream()
            .collect(Collectors.toMap(UserLessonProgress::getLessonId, p -> p));

        List<LessonProgressDTO> inProgress = new ArrayList<>();
        List<LessonProgressDTO> notStarted = new ArrayList<>();
        List<LessonProgressDTO> completed = new ArrayList<>();

        for (Lesson lesson : allLessons) {
            UserLessonProgress progress = progressMap.get(lesson.getId());
            LessonProgressDTO dto = buildLessonProgressDTO(lesson, progress, userId);

            if (progress == null) {
                notStarted.add(dto);
            } else if (progress.getStatus() == ProgressStatus.completed) {
                completed.add(dto);
            } else {
                inProgress.add(dto);
            }
        }

        // Sort each bucket
        inProgress.sort(Comparator.comparing(LessonProgressDTO::getLastAccessedAt,
            Comparator.nullsLast(Comparator.reverseOrder())));
        completed.sort(Comparator.comparing(LessonProgressDTO::getCompletedAt,
            Comparator.nullsLast(Comparator.reverseOrder())));

        List<LessonProgressDTO> result = new ArrayList<>();
        result.addAll(inProgress);
        result.addAll(notStarted);
        result.addAll(completed);
        return result;
    }

    /**
     * Get detailed progress for a single lesson.
     */
    public LessonProgressDTO getLessonProgress(String username, Integer lessonId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<UserLessonProgress> progress = userLessonProgressRepository
            .findByUserIdAndLessonId(userId, lessonId);

        return buildLessonProgressDTO(lesson, progress.orElse(null), userId);
    }

    /**
     * Start a lesson — creates in_progress row if none exists.
     */
    @Transactional
    public void startLesson(String username, Integer lessonId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<UserLessonProgress> existing = userLessonProgressRepository
            .findByUserIdAndLessonId(userId, lessonId);

        if (existing.isEmpty()) {
            UserLessonProgress progress = new UserLessonProgress();
            progress.setUserId(userId);
            progress.setLessonId(lessonId);
            progress.setStatus(ProgressStatus.in_progress);
            userLessonProgressRepository.save(progress);
        } else {
            // Update last_accessed_at
            UserLessonProgress progress = existing.get();
            progress.setLastAccessedAt(LocalDateTime.now());
            userLessonProgressRepository.save(progress);
        }
    }

    /**
     * Mark a card as completed for a user.
     * Also ensures lesson progress row exists (in_progress).
     * Checks if lesson is now fully completed.
     */
    @Transactional
    public void markCardComplete(String username, Integer cardId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found"));

        // Skip if already completed
        if (userCardProgressRepository.existsByUserIdAndCardId(userId, cardId)) {
            return;
        }

        // Insert card progress
        UserCardProgress cardProgress = new UserCardProgress();
        cardProgress.setUserId(userId);
        cardProgress.setCardId(cardId);
        userCardProgressRepository.save(cardProgress);

        // Ensure lesson progress row exists
        Integer lessonId = card.getChapter().getLesson().getId();
        ensureLessonProgressExists(userId, lessonId);

        // Check if lesson is now fully completed
        checkAndUpdateLessonCompletion(userId, lessonId);
    }

    // ─── Private helpers ───────────────────────────────────────

    private LessonProgressDTO buildLessonProgressDTO(Lesson lesson,
                                                      UserLessonProgress progress,
                                                      Integer userId) {
        List<Chapter> chapters = chapterRepository.findByLessonId(lesson.getId());

        int totalItems = 0;
        int completedItems = 0;
        List<ChapterProgressDTO> chapterDTOs = new ArrayList<>();

        for (Chapter chapter : chapters) {
            List<Card> cards = cardRepository.findByChapterId(chapter.getId());
            int totalCards = cards.size();
            int completedCards = userCardProgressRepository
                .countByUserIdAndChapterId(userId, chapter.getId());

            boolean hasQuiz = !quizRepository.findByChapterId(chapter.getId()).isEmpty();
            boolean quizCompleted = false;
            if (hasQuiz) {
                quizCompleted = quizResultRepository
                    .findByUserIdAndChapterId(userId, chapter.getId()).isPresent();
            }

            int chapterTotal = totalCards + (hasQuiz ? 1 : 0);
            int chapterCompleted = completedCards + (quizCompleted ? 1 : 0);
            double chapterPercent = chapterTotal > 0
                ? (chapterCompleted * 100.0 / chapterTotal) : 0.0;

            chapterDTOs.add(new ChapterProgressDTO(
                chapter.getId(),
                chapter.getTitle(),
                totalCards,
                completedCards,
                hasQuiz,
                quizCompleted,
                chapterTotal,
                chapterCompleted,
                Math.round(chapterPercent * 10.0) / 10.0
            ));

            totalItems += chapterTotal;
            completedItems += chapterCompleted;
        }

        double progressPercent = totalItems > 0
            ? (completedItems * 100.0 / totalItems) : 0.0;
        progressPercent = Math.round(progressPercent * 10.0) / 10.0;

        String status = progress == null ? "not_started" : progress.getStatus().name();

        return new LessonProgressDTO(
            lesson.getId(),
            lesson.getTitle(),
            lesson.getDescription(),
            lesson.getLessonPictureUrl(),
            status,
            progress != null ? progress.getLastAccessedAt() : null,
            progress != null ? progress.getCompletedAt() : null,
            chapterDTOs,
            totalItems,
            completedItems,
            progressPercent
        );
    }

    private void ensureLessonProgressExists(Integer userId, Integer lessonId) {
        Optional<UserLessonProgress> existing = userLessonProgressRepository
            .findByUserIdAndLessonId(userId, lessonId);

        if (existing.isEmpty()) {
            UserLessonProgress progress = new UserLessonProgress();
            progress.setUserId(userId);
            progress.setLessonId(lessonId);
            progress.setStatus(ProgressStatus.in_progress);
            userLessonProgressRepository.save(progress);
        } else {
            UserLessonProgress progress = existing.get();
            progress.setLastAccessedAt(LocalDateTime.now());
            userLessonProgressRepository.save(progress);
        }
    }

    private void checkAndUpdateLessonCompletion(Integer userId, Integer lessonId) {
        List<Chapter> chapters = chapterRepository.findByLessonId(lessonId);

        for (Chapter chapter : chapters) {
            List<Card> cards = cardRepository.findByChapterId(chapter.getId());
            int completedCards = userCardProgressRepository
                .countByUserIdAndChapterId(userId, chapter.getId());

            if (completedCards < cards.size()) return; // not all cards done

            boolean hasQuiz = !quizRepository.findByChapterId(chapter.getId()).isEmpty();
            if (hasQuiz) {
                boolean quizDone = quizResultRepository
                    .findByUserIdAndChapterId(userId, chapter.getId()).isPresent();
                if (!quizDone) return; // quiz not done
            }
        }

        // All chapters fully completed — mark lesson as completed
        userLessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
            .ifPresent(progress -> {
                progress.setStatus(ProgressStatus.completed);
                progress.setCompletedAt(LocalDateTime.now());
                userLessonProgressRepository.save(progress);
            });
    }
}
