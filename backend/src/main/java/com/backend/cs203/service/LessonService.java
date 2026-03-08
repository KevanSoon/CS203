package com.backend.cs203.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.dto.card.CreateCardRequest;
import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.dto.chapter.CreateChapterRequest;
import com.backend.cs203.dto.lesson.CreateLessonRequest;
import com.backend.cs203.dto.lesson.CreateLessonResponse;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.dto.quiz.CreateQuizRequest;
import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.entity.Review;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CardRepository cardRepository;
    private final QuizRepository quizRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final EntityManager entityManager;

    public List<LessonSummaryResponse> getAllLessons() {
        return lessonRepository.findAllLessons().stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
    }

    /** Return all existing tag names for autocomplete. */
    public List<String> getAllTags() {
        return lessonRepository.findAllTagNames();
    }

    /** Check whether a lesson title already exists (any status). */
    public boolean isTitleTaken(String title) {
        return lessonRepository.countByTitleNotDeleted(title) > 0;
    }

    public List<LessonSummaryResponse> getUserCreatedLessons(int id) {
        return lessonRepository.findUserCreatedLessons(id).stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
    }

    public List<LessonApplicationDTO> getAllLessonApplications() {
        return lessonRepository.findAllLessonApplications();
    }

    public List<LessonSummaryResponse> getPendingLessonApplications() {
        return lessonRepository.findAllPendingLessonApplications().stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
    }

    public List<LessonApplicationDTO> getUserCreatedLessonApplications(int userId) { // ← NEW
        return lessonRepository.findUserCreatedLessonApplications(userId);
    }

    private LessonSummaryResponse toResponseWithSignedUrl(LessonSummaryDTO dto) {
        String picUrl = dto.getLessonPictureUrl();
        String signedUrl = (picUrl != null)
                ? supabaseStorageService.getSignedUrl(picUrl, 3600)
                : null;
        return new LessonSummaryResponse(
                dto.getId(),
                dto.getTitle(),
                dto.getDescription(),
                dto.getCreatedBy(),
                dto.getCreatedAt(),
                dto.getTags(),
                signedUrl
        );
    }

    public LessonPageDTO getLessonPage(String lessonTitle) {
        Lesson lesson = lessonRepository.findByTitle(lessonTitle)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<Chapter> chapters = chapterRepository.findByLessonId(lesson.getId());

        List<ChapterDTO> chapterDetails = chapters.stream().map(chapter -> {
            List<CardDTO> cards = cardRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(card -> new CardDTO(card.getId(), card.getFront(), card.getBack(), card.getDisplayOrder()))
                    .collect(Collectors.toList());
            List<QuizDTO> quizzes = quizRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(quiz -> new QuizDTO(quiz.getId(), quiz.getTitle(), quiz.getQuestion(), quiz.getQuizType().name(), quiz.getOptions(), quiz.getCorrectAnswer()))
                    .collect(Collectors.toList());

            return new ChapterDTO(chapter.getId(), chapter.getTitle(), chapter.getDescription(), cards, quizzes);
        }).collect(Collectors.toList());

        return new LessonPageDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getCreatedBy().getUsername(),
                lesson.getCreatedAt(),
                chapterDetails
        );
    }

    public LessonRatingDTO getLessonRating(Integer lessonId, Integer userId) {
        Double avg = reviewRepository.findAverageRatingByLessonId(lessonId);
        Integer count = reviewRepository.findRatingCountByLessonId(lessonId);
        boolean hasReviewed = reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId);

        return new LessonRatingDTO(
                lessonId,
                avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                count != null ? count : 0,
                hasReviewed
        );
    }

    public void submitReview(Integer lessonId, Integer userId, int rating) {
        if (reviewRepository.existsByReviewedByIdAndLessonId(userId, lessonId)) {
            throw new RuntimeException("You have already reviewed this lesson");
        }
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setRating((byte) rating);
        review.setLesson(lesson);
        review.setReviewedBy(user);
        reviewRepository.save(review);
    }

    @Transactional
    public CreateLessonResponse createLesson(CreateLessonRequest request, User user) {
        // 1. Create and save the Lesson entity
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setStatus(Lesson.LessonStatus.pending);
        lesson.setCreatedBy(user);
        lesson.setLessonPictureUrl(request.getLessonPictureUrl());
        lesson = lessonRepository.save(lesson);

        // 2. Save tags if provided
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            for (String tagName : request.getTags()) {
                String trimmed = tagName.trim();
                if (trimmed.isEmpty()) continue;
                // Insert tag if it doesn't exist
                entityManager.createNativeQuery(
                    "INSERT IGNORE INTO tag (name) VALUES (:name)")
                    .setParameter("name", trimmed)
                    .executeUpdate();
                // Insert lesson_tagging
                entityManager.createNativeQuery(
                    "INSERT INTO lesson_tagging (tag_name, lesson_id) VALUES (:tagName, :lessonId)")
                    .setParameter("tagName", trimmed)
                    .setParameter("lessonId", lesson.getId())
                    .executeUpdate();
            }
        }

        // 3. Create chapters with their cards and quiz
        for (CreateChapterRequest chapterReq : request.getChapters()) {
            Chapter chapter = new Chapter();
            chapter.setTitle(chapterReq.getTitle());
            chapter.setDescription(chapterReq.getDescription());
            chapter.setLesson(lesson);
            chapter = chapterRepository.save(chapter);

            // Save cards for this chapter
            if (chapterReq.getCards() != null) {
                for (CreateCardRequest cardReq : chapterReq.getCards()) {
                    Card card = new Card();
                    card.setFront(cardReq.getFront());
                    card.setBack(cardReq.getBack());
                    card.setDisplayOrder(cardReq.getDisplayOrder());
                    card.setChapter(chapter);
                    cardRepository.save(card);
                }
            }

            // Save quiz questions for this chapter
            if (chapterReq.getQuizzes() != null) {
                for (CreateQuizRequest quizReq : chapterReq.getQuizzes()) {
                    Quiz quiz = new Quiz();
                    quiz.setTitle(quizReq.getTitle());
                    quiz.setQuestion(quizReq.getQuestion());
                    quiz.setOptions(quizReq.getOptions());
                    quiz.setCorrectAnswer(quizReq.getCorrectAnswer());
                    try {
                        quiz.setQuizType(Quiz.QuizType.valueOf(quizReq.getQuizType()));
                    } catch (Exception e) {
                        quiz.setQuizType(Quiz.QuizType.mcq);
                    }
                    quiz.setChapter(chapter);
                    quizRepository.save(quiz);
                }
            }
        }

        return new CreateLessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getStatus().name(),
                user.getUsername(),
                lesson.getCreatedAt(),
                "Lesson created successfully and submitted for approval"
        );
    }

    /**
     * Get full lesson page for admin editing (any status, owned by user)
     */
    public LessonPageDTO getAdminLessonPage(String lessonTitle, Integer userId) {
        Lesson lesson = lessonRepository.findByTitleAndCreatedBy(lessonTitle, userId)
                .orElseThrow(() -> new RuntimeException("Lesson not found or you don't have permission to edit it"));

        List<Chapter> chapters = chapterRepository.findByLessonId(lesson.getId());

        List<ChapterDTO> chapterDetails = chapters.stream().map(chapter -> {
            List<CardDTO> cards = cardRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(card -> new CardDTO(card.getId(), card.getFront(), card.getBack(), card.getDisplayOrder()))
                    .collect(Collectors.toList());
            List<QuizDTO> quizzes = quizRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(quiz -> new QuizDTO(quiz.getId(), quiz.getTitle(), quiz.getQuestion(), quiz.getQuizType().name(), quiz.getOptions(), quiz.getCorrectAnswer()))
                    .collect(Collectors.toList());
            return new ChapterDTO(chapter.getId(), chapter.getTitle(), chapter.getDescription(), cards, quizzes);
        }).collect(Collectors.toList());

        // Fetch tags for this lesson
        List<String> tags = lessonRepository.findTagsByLessonId(lesson.getId());

        return new LessonPageDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getCreatedBy().getUsername(),
                lesson.getCreatedAt(),
                chapterDetails,
                tags
        );
    }

    /**
     * Update an existing lesson (replace all chapters/cards/quizzes)
     */
    @Transactional
    public CreateLessonResponse updateLesson(String originalTitle, CreateLessonRequest request, User user) {
        Lesson lesson = lessonRepository.findByTitleAndCreatedBy(originalTitle, user.getId())
                .orElseThrow(() -> new RuntimeException("Lesson not found or you don't have permission to edit it"));

        // Only allow editing pending or rejected lessons
        if (lesson.getStatus() != Lesson.LessonStatus.pending && lesson.getStatus() != Lesson.LessonStatus.rejected) {
            throw new RuntimeException("Only pending or rejected lessons can be edited");
        }

        // Update lesson fields
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setLessonPictureUrl(request.getLessonPictureUrl());
        lesson.setStatus(Lesson.LessonStatus.pending); // re-submit for approval
        lessonRepository.save(lesson);

        // Delete old tags and re-insert
        entityManager.createNativeQuery(
            "DELETE FROM lesson_tagging WHERE lesson_id = :lessonId")
            .setParameter("lessonId", lesson.getId())
            .executeUpdate();

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            for (String tagName : request.getTags()) {
                String trimmed = tagName.trim();
                if (trimmed.isEmpty()) continue;
                entityManager.createNativeQuery(
                    "INSERT IGNORE INTO tag (name) VALUES (:name)")
                    .setParameter("name", trimmed)
                    .executeUpdate();
                entityManager.createNativeQuery(
                    "INSERT INTO lesson_tagging (tag_name, lesson_id) VALUES (:tagName, :lessonId)")
                    .setParameter("tagName", trimmed)
                    .setParameter("lessonId", lesson.getId())
                    .executeUpdate();
            }
        }

        // Delete old chapters (cards and quizzes cascade via DB foreign keys, or delete manually)
        List<Chapter> oldChapters = chapterRepository.findByLessonId(lesson.getId());
        for (Chapter oldChapter : oldChapters) {
            // Delete cards and quizzes for this chapter
            entityManager.createNativeQuery("DELETE FROM card WHERE chapter_id = :chapterId")
                    .setParameter("chapterId", oldChapter.getId()).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM quiz WHERE chapter_id = :chapterId")
                    .setParameter("chapterId", oldChapter.getId()).executeUpdate();
        }
        entityManager.createNativeQuery("DELETE FROM chapter WHERE lesson_id = :lessonId")
                .setParameter("lessonId", lesson.getId()).executeUpdate();

        // Re-create chapters with cards and quizzes
        for (CreateChapterRequest chapterReq : request.getChapters()) {
            Chapter chapter = new Chapter();
            chapter.setTitle(chapterReq.getTitle());
            chapter.setDescription(chapterReq.getDescription());
            chapter.setLesson(lesson);
            chapter = chapterRepository.save(chapter);

            if (chapterReq.getCards() != null) {
                for (CreateCardRequest cardReq : chapterReq.getCards()) {
                    Card card = new Card();
                    card.setFront(cardReq.getFront());
                    card.setBack(cardReq.getBack());
                    card.setDisplayOrder(cardReq.getDisplayOrder());
                    card.setChapter(chapter);
                    cardRepository.save(card);
                }
            }

            if (chapterReq.getQuizzes() != null) {
                for (CreateQuizRequest quizReq : chapterReq.getQuizzes()) {
                    Quiz quiz = new Quiz();
                    quiz.setTitle(quizReq.getTitle());
                    quiz.setQuestion(quizReq.getQuestion());
                    quiz.setOptions(quizReq.getOptions());
                    quiz.setCorrectAnswer(quizReq.getCorrectAnswer());
                    try {
                        quiz.setQuizType(Quiz.QuizType.valueOf(quizReq.getQuizType()));
                    } catch (Exception e) {
                        quiz.setQuizType(Quiz.QuizType.mcq);
                    }
                    quiz.setChapter(chapter);
                    quizRepository.save(quiz);
                }
            }
        }

        return new CreateLessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getStatus().name(),
                user.getUsername(),
                lesson.getCreatedAt(),
                "Lesson updated successfully and re-submitted for approval"
        );
    }
}

