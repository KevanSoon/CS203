package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
import com.backend.cs203.dto.review.ReviewDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.entity.Report;
import com.backend.cs203.entity.Review;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.ReportRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final ReportRepository reportRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final EntityManager entityManager;

    public List<LessonSummaryResponse> getAllLessons() {
        return lessonRepository.findAllLessons().stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
    }

    /**
     * Return all existing tag names for autocomplete.
     */
    public List<String> getAllTags() {
        return lessonRepository.findAllTagNames();
    }

    /**
     * Check whether a lesson title already exists (any status).
     */
    public boolean isTitleTaken(String title) {
        return lessonRepository.countByTitleNotDeleted(title) > 0;
    }

    public List<LessonApplicationDTO> getUserCreatedLessons(int id) {
        return lessonRepository.findUserCreatedLessons(id);
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
                signedUrl,
                dto.getDeletedAt()
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
                lesson.getLessonPictureUrl(),
                lesson.getCreatedBy().getUsername(),
                lesson.getCreatedAt(),
                chapterDetails,
                null
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

    public void submitReview(Integer lessonId, Integer userId, int rating, String feedback) {

        System.out.println("lessonId: " + lessonId);
        System.out.println("userId: " + userId);
        System.out.println("rating: " + rating);
        System.out.println("feedback: " + feedback);

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
        review.setFeedback(feedback);
        review.setLesson(lesson);
        review.setReviewedBy(user);
        reviewRepository.save(review);
    }

    public ReviewDTO getUserReview(Integer lessonId, Integer userId) {
        Review review = reviewRepository
                .findByReviewedByIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return new ReviewDTO(
                lessonId,
                userId,
                review.getRating(),
                review.getFeedback()
        );
    }

    @Transactional
    public CreateLessonResponse createLesson(CreateLessonRequest request, User user) {
        // 1. Create and save the Lesson entity
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setStatus(Lesson.LessonStatus.pending);
        lesson.setCreatedBy(user);
        lesson = lessonRepository.save(lesson);

        ObjectMapper mapper = new ObjectMapper();
        List<CreateChapterRequest> chapterList;
        try {
            chapterList = mapper.readValue(request.getChapters(), new TypeReference<List<CreateChapterRequest>>() {
            });
        } catch (Exception e) {
            throw new RuntimeException("Invalid chapters format");
        }
        List<String> tagList = null;
        try {
            if (request.getTags() != null && !request.getTags().isBlank()) {
                tagList = mapper.readValue(request.getTags(), new TypeReference<List<String>>() {
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid tags format");
        }
        MultipartFile lessonImage = request.getLessonPictureUrl();
        if (lessonImage != null && !lessonImage.isEmpty()) {
            String imagePath = supabaseStorageService.uploadFile("lesson-pictures", lessonImage);
            lesson.setLessonPictureUrl(imagePath);
            lesson = lessonRepository.save(lesson);
        }

        // 2. Save tags if provided
        if (tagList != null && !tagList.isEmpty()) {
            for (String tagName : tagList) {
                String trimmed = tagName.trim();
                if (trimmed.isEmpty()) {
                    continue;
                }
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
        for (CreateChapterRequest chapterReq : chapterList) {
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

        List<String> tags = lessonRepository.findTagsByLessonId(lesson.getId());

        String signedUrl = lesson.getLessonPictureUrl() != null
                ? supabaseStorageService.getSignedUrl(lesson.getLessonPictureUrl(), 3600)
                : null;

        return new LessonPageDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                signedUrl,
                lesson.getCreatedBy().getUsername(),
                lesson.getCreatedAt(),
                chapterDetails,
                tags
        );
    }

    /**
     * Get full lesson page for ROOT review (read-only, any status).
     */
    public LessonPageDTO getRootLessonApplicationPage(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Lesson title must be provided");
        }
        Lesson lesson = lessonRepository.findByTitleNotDeleted(title)
                .orElseThrow(() -> new RuntimeException("Lesson application not found"));
        return buildLessonPageDTO(lesson);
    }

    private LessonPageDTO buildLessonPageDTO(Lesson lesson) {

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
                lesson.getLessonPictureUrl(),
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

        ObjectMapper mapper = new ObjectMapper();
        List<CreateChapterRequest> chapterList;
        try {
            chapterList = mapper.readValue(request.getChapters(), new TypeReference<List<CreateChapterRequest>>() {
            });
        } catch (Exception e) {
            throw new RuntimeException("Invalid chapters format");
        }
        List<String> tagList = null;
        try {
            if (request.getTags() != null && !request.getTags().isBlank()) {
                tagList = mapper.readValue(request.getTags(), new TypeReference<List<String>>() {
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid tags format");
        }

        // Only allow editing pending or rejected lessons
        if (lesson.getStatus() != Lesson.LessonStatus.pending && lesson.getStatus() != Lesson.LessonStatus.rejected) {
            throw new RuntimeException("Only pending or rejected lessons can be edited");
        }

        // Update lesson fields
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        MultipartFile lessonImage = request.getLessonPictureUrl();
        if (lessonImage != null && !lessonImage.isEmpty()) {
            String existingUrl = lesson.getLessonPictureUrl();
            if (existingUrl != null) {
                try {
                    supabaseStorageService.deleteFile(existingUrl);
                } catch (Exception e) {
                    // don't block the update if delete fails
                }
            }
            String imagePath = supabaseStorageService.uploadFile("lesson-pictures", lessonImage);
            lesson.setLessonPictureUrl(imagePath);
        }
        lesson.setStatus(Lesson.LessonStatus.pending); // re-submit for approval
        lessonRepository.save(lesson);

        // Delete old tags and re-insert
        entityManager.createNativeQuery(
                "DELETE FROM lesson_tagging WHERE lesson_id = :lessonId")
                .setParameter("lessonId", lesson.getId())
                .executeUpdate();

        if (tagList != null && !tagList.isEmpty()) {
            for (String tagName : tagList) {
                String trimmed = tagName.trim();
                if (trimmed.isEmpty()) {
                    continue;
                }
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
        for (CreateChapterRequest chapterReq : chapterList) {
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

    @Transactional
public void deleteLesson(Integer lessonId, Integer userId) {
    Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
    if (!lesson.getCreatedBy().getId().equals(userId)) {
        throw new AuthorizationDeniedException("You do not have permission to delete this lesson");
    }
    if (lesson.getDeletedAt() != null) {
        throw new RuntimeException("Lesson already deleted");
    }
    lesson.setDeletedAt(LocalDateTime.now());
    lessonRepository.save(lesson);

    // --- Close all open reports for this lesson ---
    List<Report> openReports = reportRepository.findNotClosedReportsByLessonId(lessonId);
    for (Report report : openReports) {
        report.setStatus(Report.ReportStatus.closed);
        String oldRemarks = report.getRemarks() == null ? "" : report.getRemarks();
        if (!oldRemarks.isEmpty() && !oldRemarks.endsWith("\n")) {
            oldRemarks += "\n";
        }
        report.setRemarks(oldRemarks + "\nLesson Admin closed lesson");
        reportRepository.save(report);
    }
}
}
