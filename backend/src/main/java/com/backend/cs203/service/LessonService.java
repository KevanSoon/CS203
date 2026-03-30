package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import com.backend.cs203.dto.lesson.AdminLessonStatsDTO;
import com.backend.cs203.dto.lesson.CreateLessonRequest;
import com.backend.cs203.dto.lesson.CreateLessonResponse;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonReviewResponse;
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
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {

    private static final int LESSON_TITLE_MAX_LENGTH = 255;
    private static final DateTimeFormatter DELETE_SUFFIX_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CardRepository cardRepository;
    private final QuizRepository quizRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final ReportRepository reportRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final VectorStoreService vectorStoreService;
    private final EntityManager entityManager;

    public List<LessonSummaryResponse> getAllLessons() {
        return lessonRepository.findAllLessons().stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
    }

    public List<String> getAllTags() {
        return lessonRepository.findAllTagNames();
    }

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

    public List<LessonApplicationDTO> getUserCreatedLessonApplications(int userId) {
        return lessonRepository.findUserCreatedLessonApplications(userId);
    }

    public AdminLessonStatsDTO getAdminLessonStats(int adminId) {
        long totalLessons = lessonRepository.countPendingAndApprovedByUserId(adminId);
        long publishedLessons = lessonRepository.countPublishedByUserId(adminId);
        long totalAttempts = userLessonProgressRepository.countAttemptsByAdminId(adminId);
        long totalCompletions = userLessonProgressRepository.countCompletionsByAdminId(adminId);
        return new AdminLessonStatsDTO(totalLessons, publishedLessons, totalAttempts, totalCompletions);
    }

    // ← ADDED updatedAt to LessonSummaryResponse constructor
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
                dto.getUpdatedAt(),  
                dto.getTags(),
                signedUrl,
                dto.getDeletedAt(),
                dto.getStatus()
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
        Lesson lesson = new Lesson();
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setStatus(request.isDraft() ? Lesson.LessonStatus.saved : Lesson.LessonStatus.pending);
        lesson.setCreatedBy(user);
        lesson = lessonRepository.save(lesson);

        ObjectMapper mapper = new ObjectMapper();
        List<CreateChapterRequest> chapterList = List.of();
        if (request.getChapters() != null && !request.getChapters().isBlank()) {
            try {
                chapterList = mapper.readValue(request.getChapters(), new TypeReference<List<CreateChapterRequest>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Invalid chapters format");
            }
        } else if (!request.isDraft()) {
            throw new RuntimeException("A lesson must have at least one chapter");
        }

        List<String> tagList = null;
        try {
            if (request.getTags() != null && !request.getTags().isBlank()) {
                tagList = mapper.readValue(request.getTags(), new TypeReference<List<String>>() {});
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

        if (tagList != null && !tagList.isEmpty()) {
            for (String tagName : tagList) {
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

        String message = request.isDraft()
                ? "Lesson draft saved successfully"
                : "Lesson created successfully and submitted for approval";
        return new CreateLessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getStatus().name(),
                user.getUsername(),
                lesson.getCreatedAt(),
                message
        );
    }

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
                tags,
                lesson.getStatus().name()
        );
    }

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

    @Transactional
    public CreateLessonResponse updateLesson(String originalTitle, CreateLessonRequest request, User user) {
        Lesson lesson = lessonRepository.findByTitleAndCreatedBy(originalTitle, user.getId())
                .orElseThrow(() -> new RuntimeException("Lesson not found or you don't have permission to edit it"));

        ObjectMapper mapper = new ObjectMapper();
        List<CreateChapterRequest> chapterList = List.of();
        if (request.getChapters() != null && !request.getChapters().isBlank()) {
            try {
                chapterList = mapper.readValue(request.getChapters(), new TypeReference<List<CreateChapterRequest>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Invalid chapters format");
            }
        } else if (!request.isDraft()) {
            throw new RuntimeException("A lesson must have at least one chapter");
        }

        List<String> tagList = null;
        try {
            if (request.getTags() != null && !request.getTags().isBlank()) {
                tagList = mapper.readValue(request.getTags(), new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid tags format");
        }

        if (lesson.getStatus() != Lesson.LessonStatus.saved
                && lesson.getStatus() != Lesson.LessonStatus.pending
                && lesson.getStatus() != Lesson.LessonStatus.rejected) {
            throw new RuntimeException("Only saved, pending, or rejected lessons can be edited");
        }

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
        lesson.setStatus(request.isDraft() ? Lesson.LessonStatus.saved : Lesson.LessonStatus.pending);
        lesson.setUpdatedAt(LocalDateTime.now());   // ← ADDED
        lessonRepository.save(lesson);

        entityManager.createNativeQuery(
                "DELETE FROM lesson_tagging WHERE lesson_id = :lessonId")
                .setParameter("lessonId", lesson.getId())
                .executeUpdate();

        if (tagList != null && !tagList.isEmpty()) {
            for (String tagName : tagList) {
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

        List<Chapter> oldChapters = chapterRepository.findByLessonId(lesson.getId());
        for (Chapter oldChapter : oldChapters) {
            entityManager.createNativeQuery("DELETE FROM card WHERE chapter_id = :chapterId")
                    .setParameter("chapterId", oldChapter.getId()).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM quiz WHERE chapter_id = :chapterId")
                    .setParameter("chapterId", oldChapter.getId()).executeUpdate();
        }
        entityManager.createNativeQuery("DELETE FROM chapter WHERE lesson_id = :lessonId")
                .setParameter("lessonId", lesson.getId()).executeUpdate();

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

        String updateMessage = request.isDraft()
                ? "Lesson draft saved successfully"
                : "Lesson updated successfully and re-submitted for approval";
        return new CreateLessonResponse(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getStatus().name(),
                user.getUsername(),
                lesson.getCreatedAt(),
                updateMessage
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

        LocalDateTime deletedAt = LocalDateTime.now();
        String suffix = "_deletedat_" + deletedAt.format(DELETE_SUFFIX_TIME_FORMATTER) + "_" + lesson.getId();
        String currentTitle = lesson.getTitle() == null ? "lesson" : lesson.getTitle().trim();
        int maxBaseLength = Math.max(1, LESSON_TITLE_MAX_LENGTH - suffix.length());
        String baseTitle = currentTitle.length() > maxBaseLength
            ? currentTitle.substring(0, maxBaseLength)
            : currentTitle;

        lesson.setTitle(baseTitle + suffix);
        lesson.setDeletedAt(deletedAt);
        lessonRepository.save(lesson);

        vectorStoreService.deleteLesson(lessonId);

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

    public List<LessonReviewResponse> getReviewsForLesson(Integer lessonId) {
        return reviewRepository
                .findByLessonIdOrderByCreatedAtDesc(lessonId)
                .stream()
                .map(r -> {
                    User user = r.getReviewedBy();
                    String avatarUrl = user.getProfilePictureUrl() != null
                            ? supabaseStorageService.getSignedUrl(user.getProfilePictureUrl(), 3600)
                            : null;
                    return new LessonReviewResponse(
                            r.getId(),
                            user.getUsername(),
                            avatarUrl,
                            (int) r.getRating(),
                            r.getFeedback(),
                            r.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void reviewLessonApplication(String title, String action) {
        System.out.println(">>> reviewLessonApplication called: title=" + title + ", action=" + action);

        Lesson lesson = lessonRepository.findByTitleNotDeleted(title)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + title));

        System.out.println(">>> Found lesson id=" + lesson.getId() + " status=" + lesson.getStatus());

        if (lesson.getStatus() != Lesson.LessonStatus.pending) {
            throw new IllegalStateException(
                "Lesson '" + title + "' is already " + lesson.getStatus().name() + "."
            );
        }

        Lesson.LessonStatus newStatus = "approve".equalsIgnoreCase(action)
                ? Lesson.LessonStatus.approved
                : Lesson.LessonStatus.rejected;

        lesson.setStatus(newStatus);
        lesson.setUpdatedAt(LocalDateTime.now());
        lessonRepository.save(lesson);

        System.out.println(">>> Lesson saved with status=" + newStatus + " updatedAt=" + lesson.getUpdatedAt());

        if (Lesson.LessonStatus.approved.equals(newStatus)) {
            LessonPageDTO lessonPage = buildLessonPageDTO(lesson);
            vectorStoreService.insertLesson(lessonPage);
        }
    }
}


