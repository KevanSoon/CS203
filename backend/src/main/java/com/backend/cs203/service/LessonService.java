package com.backend.cs203.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.entity.Review;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserRepository;

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

    public List<LessonSummaryResponse> getAllLessons() {
        return lessonRepository.findAllLessons().stream()
                .map(this::toResponseWithSignedUrl)
                .collect(Collectors.toList());
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
                    .map(quiz -> new QuizDTO(quiz.getId(), quiz.getTitle(), quiz.getQuestion(), quiz.getOptions(), quiz.getCorrectAnswer()))
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
}

