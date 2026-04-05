package com.backend.cs203.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.backend.cs203.dto.lesson.*;
import com.backend.cs203.dto.review.ReviewDTO;
import com.backend.cs203.entity.User;

public interface LessonService {

    List<LessonSummaryResponse> getAllLessons();

    List<String> getAllTags();

    boolean isTitleTaken(String title);

    List<LessonApplicationDTO> getUserCreatedLessons(int id);

    List<LessonApplicationDTO> getAllLessonApplications();

    List<LessonSummaryResponse> getPendingLessonApplications();

    List<LessonApplicationDTO> getUserCreatedLessonApplications(int userId);

    AdminLessonStatsDTO getAdminLessonStats(int adminId);

    LessonPageDTO getLessonPage(String lessonTitle);

    LessonRatingDTO getLessonRating(Integer lessonId, Integer userId);

    void submitReview(Integer lessonId, Integer userId, int rating, String feedback);

    ReviewDTO getUserReview(Integer lessonId, Integer userId);

    CreateLessonResponse createLesson(CreateLessonRequest request, User user);

    LessonPageDTO getAdminLessonPage(String lessonTitle, Integer userId);

    LessonPageDTO getRootLessonApplicationPage(String title);

    CreateLessonResponse updateLesson(String originalTitle, CreateLessonRequest request, User user);

    void deleteLesson(Integer lessonId, Integer userId);

    List<LessonReviewResponse> getReviewsForLesson(Integer lessonId);

    void reviewLessonApplication(String title, String action);
}