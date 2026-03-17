package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.progress.ChapterProgressDTO;
import com.backend.cs203.dto.progress.DashboardProgressDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.User;
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
     * Lightweight dashboard: returns progress-only data for every approved lesson.
     * Uses batch queries — O(1) queries regardless of lesson/chapter count.
     */
    @Transactional(readOnly = true)
    public List<DashboardProgressDTO> getDashboard(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        // 1 query: all approved lessons
        List<Lesson> allLessons = lessonRepository.findAll().stream()
            .filter(l -> l.getStatus() == Lesson.LessonStatus.approved)
            .toList();

        // 1 query: all chapters (we'll group by lessonId in memory)
        List<Chapter> allChapters = chapterRepository.findAll();
        Map<Integer, List<Chapter>> chaptersByLesson = allChapters.stream()
            .collect(Collectors.groupingBy(ch -> ch.getLesson().getId()));

        // 1 query: user's lesson progress
        Map<Integer, UserLessonProgress> progressMap = userLessonProgressRepository
            .findByUserId(userId).stream()
            .collect(Collectors.toMap(UserLessonProgress::getLessonId, p -> p));

        // 1 query: total cards per chapter (batch)
        Map<Integer, Integer> totalCardsByChapter = new HashMap<>();
        for (Object[] row : cardRepository.countCardsGroupedByChapter()) {
            totalCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        // 1 query: completed cards per chapter for this user (batch)
        Map<Integer, Integer> completedCardsByChapter = new HashMap<>();
        for (Object[] row : userCardProgressRepository.countCompletedCardsGroupedByChapter(userId)) {
            completedCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        // 1 query: chapter IDs that have quizzes
        Set<Integer> chaptersWithQuiz = new HashSet<>(quizRepository.findChapterIdsWithQuiz());

        // 1 query: chapter IDs where user completed the quiz
        Set<Integer> completedQuizChapters = new HashSet<>(
            quizResultRepository.findCompletedChapterIdsByUserId(userId));

        // Build result — pure in-memory, no more DB calls
        List<DashboardProgressDTO> result = new ArrayList<>();
        for (Lesson lesson : allLessons) {
            UserLessonProgress progress = progressMap.get(lesson.getId());
            String status = progress == null ? "not_started" : progress.getStatus().name();

            List<Chapter> chapters = chaptersByLesson.getOrDefault(lesson.getId(), List.of());
            int totalItems = 0;
            int completedItems = 0;

            for (Chapter chapter : chapters) {
                int totalCards = totalCardsByChapter.getOrDefault(chapter.getId(), 0);
                int completedCards = completedCardsByChapter.getOrDefault(chapter.getId(), 0);
                boolean hasQuiz = chaptersWithQuiz.contains(chapter.getId());
                boolean quizCompleted = hasQuiz && completedQuizChapters.contains(chapter.getId());

                totalItems += totalCards + (hasQuiz ? 1 : 0);
                completedItems += completedCards + (quizCompleted ? 1 : 0);
            }

            double percent = totalItems > 0
                ? Math.round((completedItems * 100.0 / totalItems) * 10.0) / 10.0
                : 0.0;

            result.add(new DashboardProgressDTO(
                lesson.getId(), status, totalItems, completedItems, percent
            ));
        }

        return result;
    }

    /**
     * Detailed chapter-by-chapter progress for a single lesson.
     * Uses batch queries — O(1) queries regardless of chapter count.
     */
    @Transactional(readOnly = true)
    public LessonProgressDTO getLessonProgress(String username, Integer lessonId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<UserLessonProgress> progress = userLessonProgressRepository
            .findByUserIdAndLessonId(userId, lessonId);

        String status = progress.isEmpty() ? "not_started" : progress.get().getStatus().name();

        List<Chapter> chapters = chapterRepository.findByLessonId(lesson.getId());

        // Batch: total cards per chapter
        Map<Integer, Integer> totalCardsByChapter = new HashMap<>();
        for (Object[] row : cardRepository.countCardsGroupedByChapter()) {
            totalCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        // Batch: completed cards per chapter for this user
        Map<Integer, Integer> completedCardsByChapter = new HashMap<>();
        for (Object[] row : userCardProgressRepository.countCompletedCardsGroupedByChapter(userId)) {
            completedCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        // Batch: chapters with quizzes
        Set<Integer> chaptersWithQuiz = new HashSet<>(quizRepository.findChapterIdsWithQuiz());

        // Batch: chapters where user completed quiz
        Set<Integer> completedQuizChapters = new HashSet<>(
            quizResultRepository.findCompletedChapterIdsByUserId(userId));

        int totalItems = 0;
        int completedItems = 0;
        List<ChapterProgressDTO> chapterDTOs = new ArrayList<>();

        for (Chapter chapter : chapters) {
            int totalCards = totalCardsByChapter.getOrDefault(chapter.getId(), 0);
            int completedCards = completedCardsByChapter.getOrDefault(chapter.getId(), 0);
            boolean hasQuiz = chaptersWithQuiz.contains(chapter.getId());
            boolean quizCompleted = hasQuiz && completedQuizChapters.contains(chapter.getId());

            int chapterTotal = totalCards + (hasQuiz ? 1 : 0);
            int chapterCompleted = completedCards + (quizCompleted ? 1 : 0);
            double chapterPercent = chapterTotal > 0
                ? Math.round((chapterCompleted * 100.0 / chapterTotal) * 10.0) / 10.0
                : 0.0;

            chapterDTOs.add(new ChapterProgressDTO(
                chapter.getId(), chapter.getTitle(),
                totalCards, completedCards,
                hasQuiz, quizCompleted,
                chapterTotal, chapterCompleted, chapterPercent
            ));

            totalItems += chapterTotal;
            completedItems += chapterCompleted;
        }

        double percent = totalItems > 0
            ? Math.round((completedItems * 100.0 / totalItems) * 10.0) / 10.0
            : 0.0;

        return new LessonProgressDTO(
            lesson.getId(), status, chapterDTOs, totalItems, completedItems, percent
        );
    }

    /**
     * Mark a card as completed for a user.
     * INSERT is the critical write — lesson progress housekeeping runs after.
     */
    @Transactional
    public void markCardComplete(String username, Integer cardId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Integer userId = user.getId();

        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card not found"));

        // INSERT IGNORE — idempotent, no duplicate entry error
        userCardProgressRepository.insertIgnore(userId, cardId);

        // Upsert lesson progress row + check if lesson is now fully completed
        Integer lessonId = card.getChapter().getLesson().getId();
        ensureLessonProgressExists(userId, lessonId);
        checkAndUpdateLessonCompletion(userId, lessonId);
    }

    // ─── Private helpers ───────────────────────────────────────

    private void ensureLessonProgressExists(Integer userId, Integer lessonId) {
        Optional<UserLessonProgress> existing = userLessonProgressRepository
            .findByUserIdAndLessonId(userId, lessonId);

        if (existing.isEmpty()) {
            UserLessonProgress p = new UserLessonProgress();
            p.setUserId(userId);
            p.setLessonId(lessonId);
            p.setStatus(ProgressStatus.in_progress);
            userLessonProgressRepository.save(p);
        }
        // No update needed if row already exists — no lastAccessedAt noise
    }

    private void checkAndUpdateLessonCompletion(Integer userId, Integer lessonId) {
        List<Chapter> chapters = chapterRepository.findByLessonId(lessonId);

        // Batch: total cards per chapter
        Map<Integer, Integer> totalCardsByChapter = new HashMap<>();
        for (Object[] row : cardRepository.countCardsGroupedByChapter()) {
            totalCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        // Batch: completed cards per chapter for this user
        Map<Integer, Integer> completedCardsByChapter = new HashMap<>();
        for (Object[] row : userCardProgressRepository.countCompletedCardsGroupedByChapter(userId)) {
            completedCardsByChapter.put((Integer) row[0], ((Number) row[1]).intValue());
        }

        Set<Integer> chaptersWithQuiz = new HashSet<>(quizRepository.findChapterIdsWithQuiz());
        Set<Integer> completedQuizChapters = new HashSet<>(
            quizResultRepository.findCompletedChapterIdsByUserId(userId));

        for (Chapter chapter : chapters) {
            int totalCards = totalCardsByChapter.getOrDefault(chapter.getId(), 0);
            int completedCards = completedCardsByChapter.getOrDefault(chapter.getId(), 0);
            if (completedCards < totalCards) return;

            if (chaptersWithQuiz.contains(chapter.getId())
                && !completedQuizChapters.contains(chapter.getId())) {
                return;
            }
        }

        // All chapters fully completed
        userLessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
            .ifPresent(p -> {
                p.setStatus(ProgressStatus.completed);
                p.setCompletedAt(LocalDateTime.now());
                userLessonProgressRepository.save(p);
            });
    }
}
