package com.backend.cs203.controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authorization.AuthorizationDeniedException;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.lesson.AdminLessonStatsDTO;
import com.backend.cs203.dto.lesson.CreateLessonResponse;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonRatingDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.LessonService;
import com.backend.cs203.exception.Exceptions.AuthException;


@WebMvcTest(LessonController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class LessonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private LessonService lessonService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private ReviewRepository reviewRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ===== GET /api/lesson/ (requires USER role) =====

    @Test
    void getAllAvailableLessons_withUserRole_returns200() throws Exception {
        LessonSummaryResponse dto = new LessonSummaryResponse(1, "Test Lesson", "A test lesson", "author", LocalDateTime.now(), LocalDateTime.now(), "java", null, LocalDateTime.now(), "approved");
        when(lessonService.getAllLessons()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/lesson/").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Lesson"))
                .andExpect(jsonPath("$[0].description").value("A test lesson"));
    }

    @Test
    void getAllAvailableLessons_emptyList_returns200() throws Exception {
        when(lessonService.getAllLessons()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/lesson/").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getAllAvailableLessons_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/lesson/"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllAvailableLessons_withAdminRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/").with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    // ===== GET /api/lesson/user-lessons/ (requires ADMIN role) =====

    @Test
    void getUserCreatedLessons_withAdminRole_returns200() throws Exception {
        User user = User.builder().id(1).username("adminuser").build();
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(user));
        when(lessonService.getUserCreatedLessons(1)).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(get("/api/lesson/user-lessons/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUserCreatedLessons_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/user-lessons/").with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserCreatedLessons_userNotFound_returns400() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/user-lessons/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is4xxClientError());
    }

    // ===== GET /api/lesson/applications/ (requires ROOT role) =====

    @Test
    void getAllLessonApplications_withRootRole_returns200() throws Exception {
        LessonApplicationDTO dto = createApplicationDTO("Pending Lesson", "A lesson", "author", LocalDateTime.now(), "java", "pending", LocalDateTime.now());
        when(lessonService.getAllLessonApplications()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/lesson/applications/").with(user("root").roles("ROOT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Pending Lesson"))
                .andExpect(jsonPath("$[0].status").value("pending"));
    }

    @Test
    void getAllLessonApplications_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/applications/").with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllLessonApplications_withAdminRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/applications/").with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    // ===== GET /api/lesson/applications/pending (requires ROOT role) =====

    @Test
    void getPendingApplications_withRootRole_returns200() throws Exception {
        when(lessonService.getPendingLessonApplications()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/lesson/applications/pending").with(user("root").roles("ROOT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getPendingApplications_withAdminRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/applications/pending").with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    // ===== GET /api/lesson/page (requires USER role) =====

    @Test
    void getLessonPage_withUserRole_returns200() throws Exception {
        LessonPageDTO pageDTO = new LessonPageDTO(
                1, "Test Lesson", "Description", "author",
                LocalDateTime.of(2024, 1, 1, 0, 0),
                Collections.emptyList()
        );
        when(lessonService.getLessonPage("Test Lesson")).thenReturn(pageDTO);

        mockMvc.perform(get("/api/lesson/page").param("title", "Test Lesson")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Lesson"))
                .andExpect(jsonPath("$.description").value("Description"))
                .andExpect(jsonPath("$.createdBy").value("author"))
                .andExpect(jsonPath("$.chapters").isArray());
    }

    @Test
    void getLessonPage_missingTitleParam_returns500() throws Exception {
        mockMvc.perform(get("/api/lesson/page").with(user("testuser").roles("USER")))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getLessonPage_lessonNotFound_returns400() throws Exception {
        when(lessonService.getLessonPage("Nonexistent"))
                .thenThrow(new RuntimeException("Lesson not found"));

        mockMvc.perform(get("/api/lesson/page").param("title", "Nonexistent")
                .with(user("testuser").roles("USER")))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void getLessonPage_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/lesson/page").param("title", "Test"))
                .andExpect(status().isUnauthorized());
    }

    // ===== GET /api/lesson/user-applications/ (requires ADMIN role) =====

    @Test
    void getUserCreatedLessonApplications_withAdminRole_returns200() throws Exception {
        User user = User.builder().id(1).username("adminuser").build();
        LessonApplicationDTO dto = createApplicationDTO(
                "Pending Lesson", "A lesson", "adminuser", LocalDateTime.now(), "java", "pending", LocalDateTime.now());

        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(user));
        when(lessonService.getUserCreatedLessonApplications(1)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/lesson/user-applications/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Pending Lesson"))
                .andExpect(jsonPath("$[0].status").value("pending"));

        verify(lessonService).getUserCreatedLessonApplications(1);
        verify(lessonService, never()).getUserCreatedLessons(anyInt());
    }

    @Test
    void getUserCreatedLessonApplications_withAdminRoleAndNoApplications_returnsEmptyArray() throws Exception {
        User user = User.builder().id(1).username("adminuser").build();

        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(user));
        when(lessonService.getUserCreatedLessonApplications(1)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/lesson/user-applications/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(userRepository).findByUsername("adminuser");
        verify(lessonService).getUserCreatedLessonApplications(1);
    }

    @Test
    void getUserCreatedLessonApplications_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/user-applications/").with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserCreatedLessonApplications_withRootRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/user-applications/").with(user("root").roles("ROOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserCreatedLessonApplications_userNotFound_returns400() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/user-applications/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is4xxClientError());

        verify(lessonService, never()).getUserCreatedLessonApplications(anyInt());
    }

    // ===== GET /api/lesson/admin/page (requires ADMIN role) =====

    @Test
    void getAdminLessonPage_withAdminRole_returns200() throws Exception {
        User user = User.builder().id(1).username("adminuser").build();
        LessonPageDTO pageDTO = new LessonPageDTO(
                1, "My Lesson", "Desc", "adminuser",
                LocalDateTime.of(2024, 1, 1, 0, 0),
                Collections.emptyList()
        );
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(user));
        when(lessonService.getAdminLessonPage("My Lesson", 1)).thenReturn(pageDTO);

        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson")
                .with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("My Lesson"));

        verify(lessonService).getAdminLessonPage("My Lesson", 1);
    }

    @Test
    void getAdminLessonPage_withRootRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson")
                .with(user("root").roles("ROOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAdminLessonPage_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAdminLessonPage_userNotFound_returns400() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson")
                .with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is4xxClientError());

        verify(lessonService, never()).getAdminLessonPage(any(), anyInt());
    }

    @Test
    void getAdminLessonPage_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson"))
                .andExpect(status().isUnauthorized());
    }

    // ===== GET /api/lesson/root/page (requires ROOT role) =====
    @Test
    void getRootLessonPage_withRootRole_returns200() throws Exception {
        LessonPageDTO pageDTO = new LessonPageDTO(
                2, "Pending Lesson", "Awaiting review", "author",
                LocalDateTime.of(2024, 6, 1, 0, 0),
                Collections.emptyList()
        );
        when(lessonService.getRootLessonApplicationPage("Pending Lesson")).thenReturn(pageDTO);

        mockMvc.perform(get("/api/lesson/root/page").param("title", "Pending Lesson")
                .with(user("root").roles("ROOT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.title").value("Pending Lesson"));

        verify(lessonService).getRootLessonApplicationPage("Pending Lesson");
    }

    @Test
    void getRootLessonPage_withAdminRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/root/page").param("title", "Pending Lesson")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getRootLessonPage_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/root/page").param("title", "Pending Lesson")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getRootLessonPage_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/lesson/root/page").param("title", "Pending Lesson"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getRootLessonPage_lessonNotFound_returns400() throws Exception {
        when(lessonService.getRootLessonApplicationPage("Ghost Lesson"))
                .thenThrow(new RuntimeException("Lesson application not found"));

        mockMvc.perform(get("/api/lesson/root/page").param("title", "Ghost Lesson")
                .with(user("root").roles("ROOT")))
                .andExpect(status().is4xxClientError());
    }
    // ===== DELETE /api/lesson/{lessonId} (requires ADMIN role, must be creator) =====

    @Test
    void deleteLesson_withAdminRoleAndCreator_returns200() throws Exception {
        User user = User.builder().id(123).username("admin").build();
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));

        mockMvc.perform(delete("/api/lesson/1")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(content().string("Lesson deleted successfully"));

        verify(lessonService).deleteLesson(1, 123);
    }

    @Test
    void deleteLesson_userNotFound_returns400() throws Exception {
        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/lesson/1")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().is4xxClientError());

        verify(lessonService, never()).deleteLesson(anyInt(), anyInt());
    }

    @Test
    void deleteLesson_notCreator_returns403() throws Exception {
        User user = User.builder().id(123).username("admin").build();
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        doThrow(new AuthorizationDeniedException("You do not have permission to delete this lesson"))
                .when(lessonService).deleteLesson(1, 123);

        mockMvc.perform(delete("/api/lesson/1")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You do not have permission to delete this lesson"));

        verify(lessonService).deleteLesson(1, 123);
    }

    @Test
    void deleteLesson_unauthenticated_returns401() throws Exception {
        mockMvc.perform(delete("/api/lesson/1"))
                .andExpect(status().isUnauthorized());

        verify(lessonService, never()).deleteLesson(anyInt(), anyInt());
    }

    @Test
    void deleteLesson_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(delete("/api/lesson/1")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());

        verify(lessonService, never()).deleteLesson(anyInt(), anyInt());
    }

    // ===== GET /api/lesson/admin/stats (requires ADMIN role) =====

    @Test
    void getAdminLessonStats_withAdminRole_returns200() throws Exception {
        User user = User.builder().id(1).username("adminuser").build();
        AdminLessonStatsDTO stats = new AdminLessonStatsDTO(5L, 3L, 20L, 10L);

        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(user));
        when(lessonService.getAdminLessonStats(1)).thenReturn(stats);

        mockMvc.perform(get("/api/lesson/admin/stats").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLessons").value(5))
                .andExpect(jsonPath("$.publishedLessons").value(3))
                .andExpect(jsonPath("$.totalAttempts").value(20))
                .andExpect(jsonPath("$.totalCompletions").value(10));

        verify(lessonService).getAdminLessonStats(1);
    }

    @Test
    void getAdminLessonStats_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/stats").with(user("testuser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAdminLessonStats_withRootRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/stats").with(user("root").roles("ROOT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAdminLessonStats_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/lesson/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAdminLessonStats_userNotFound_returns401() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/admin/stats").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isUnauthorized());

        verify(lessonService, never()).getAdminLessonStats(anyInt());
    }

    
    // ===== GET /api/lesson/{id}/review (requires USER role) =====

    @Test
    void getUserReview_notReviewed_returnsFalse() throws Exception {
        User user = User.builder().id(1).username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(reviewRepository.existsByReviewedByIdAndLessonId(1, 1)).thenReturn(false);

        mockMvc.perform(get("/api/lesson/1/review")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReviewed").value(false));

        verify(lessonService, never()).getUserReview(anyInt(), anyInt());
    }

    @Test
    void getUserReview_reviewExists_returnsReview() throws Exception {
        User user = User.builder().id(1).username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(reviewRepository.existsByReviewedByIdAndLessonId(1, 1)).thenReturn(true);
        when(lessonService.getUserReview(1, 1))
                .thenReturn(new com.backend.cs203.dto.review.ReviewDTO(1, 1, 5, "Great"));

        mockMvc.perform(get("/api/lesson/1/review")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasReviewed").value(true))
                .andExpect(jsonPath("$.review.lessonId").value(1))
                .andExpect(jsonPath("$.review.userId").value(1))
                .andExpect(jsonPath("$.review.rating").value(5))
                .andExpect(jsonPath("$.review.feedback").value("Great"));
    }

    @Test
    void getReviews_returns200() throws Exception {
        when(lessonService.getReviewsForLesson(1)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/lesson/1/reviews")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ===== POST /api/lesson/{id}/rating (requires USER role) =====

    @Test
    void submitReview_validRequest_returns200() throws Exception {
        User user = User.builder().id(1).username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/lesson/1/review")
                .contentType("application/json")
                .content("{\"rating\":5,\"feedback\":\"Great\"}")
                .with(user("testuser").roles("USER"))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Review submitted successfully"));

        verify(lessonService).submitReview(1, 1, 5, "Great");
    }

    
    // ===== GET /api/lesson/{id}/rating (requires USER role) =====

    @Test
    void getLessonRating_withUserRole_returns200() throws Exception {
        User user = User.builder().id(1).username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(lessonService.getLessonRating(1, 1))
                .thenReturn(new LessonRatingDTO(1, 4.5, 10, true));

        mockMvc.perform(get("/api/lesson/1/rating")
                .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(1))
                .andExpect(jsonPath("$.averageRating").value(4.5))
                .andExpect(jsonPath("$.ratingCount").value(10))
                .andExpect(jsonPath("$.hasReviewed").value(true));
    }

    // ===== GET /api/lesson/tags (requires ADMIN role) =====

    @Test
    void getAllTags_returns200() throws Exception {
        when(lessonService.getAllTags()).thenReturn(List.of("java", "spring"));

        mockMvc.perform(get("/api/lesson/tags")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("java"));
    }

    // ===== GET /api/lesson/check-title (requires ADMIN role) =====

    @Test
    void checkTitle_available_returnsTrue() throws Exception {
        when(lessonService.isTitleTaken("New")).thenReturn(false);

        mockMvc.perform(get("/api/lesson/check-title")
                .param("title", "New")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    void checkTitle_taken_returnsFalse() throws Exception {
        when(lessonService.isTitleTaken("Taken")).thenReturn(true);

        mockMvc.perform(get("/api/lesson/check-title")
                .param("title", "Taken")
                .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    // ===== PATCH /api/lesson/check-title (requires ROOT role) =====

    @Test
    void reviewLessonApplication_approve_returnsApprovedMessage() throws Exception {
        mockMvc.perform(patch("/api/lesson/applications/review")
                .contentType("application/json")
                .content("{\"title\":\"Lesson\",\"action\":\"approve\"}")
                .with(user("root").roles("ROOT"))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Lesson successfully approved."));
    }

    @Test
    void reviewLessonApplication_reject_returnsRejectedMessage() throws Exception {
        mockMvc.perform(patch("/api/lesson/applications/review")
                .contentType("application/json")
                .content("{\"title\":\"Lesson\",\"action\":\"reject\"}")
                .with(user("root").roles("ROOT"))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Lesson successfully rejected."));
    }

    // ===== POST /api/lesson/create (requires ADMIN role) =====
    
    @Test
    void createLesson_valid_returns201() throws Exception {
        User admin = User.builder().id(1).username("adminuser").build();
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(admin));

        CreateLessonResponse response = new CreateLessonResponse(
                1, "New Lesson", "Description", "draft", "adminuser",
                LocalDateTime.now(), "Lesson created successfully"
        );
        when(lessonService.createLesson(any(), eq(admin))).thenReturn(response);

        mockMvc.perform(multipart("/api/lesson/create")
                        .file("file", "dummy".getBytes()) // if your CreateLessonRequest has a file
                        .param("title", "New Lesson")
                        .param("description", "Description")
                        .param("draft", "true")
                        .with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("New Lesson"))
                .andExpect(jsonPath("$.createdBy").value("adminuser"))
                .andExpect(jsonPath("$.message").value("Lesson created successfully"));

        verify(lessonService).createLesson(any(), eq(admin));
    }

    // ===== PUT /api/lesson/update (requires ADMIN role) =====
    
    @Test
    void updateLesson_valid_returns200() throws Exception {
        User admin = User.builder().id(1).username("adminuser").build();
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(admin));

        CreateLessonResponse response = new CreateLessonResponse(
                1, "Updated Lesson", "Updated Description", "published", "adminuser",
                LocalDateTime.now(), "Lesson updated successfully"
        );
        when(lessonService.updateLesson(eq("Old Lesson"), any(), eq(admin))).thenReturn(response);

        mockMvc.perform(multipart("/api/lesson/update")
                        .file("file", "dummy".getBytes()) 
                        .param("originalTitle", "Old Lesson")
                        .param("title", "Updated Lesson")
                        .param("description", "Updated Description")
                        .param("draft", "false")
                        .with(request -> { request.setMethod("PUT"); return request; }) 
                        .with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Updated Lesson"))
                .andExpect(jsonPath("$.createdBy").value("adminuser"))
                .andExpect(jsonPath("$.message").value("Lesson updated successfully"));

        verify(lessonService).updateLesson(eq("Old Lesson"), any(), eq(admin));
    }

    // ===== Helper methods =====
    private LessonApplicationDTO createApplicationDTO(String title, String description, String createdBy,
            LocalDateTime createdAt, String tags, String status, LocalDateTime deletedAt) {
        return new LessonApplicationDTO() {
            @Override
            public Integer getId() {
                return 1;
            }

            @Override
            public String getTitle() {
                return title;
            }

            @Override
            public String getDescription() {
                return description;
            }

            @Override
            public String getCreatedBy() {
                return createdBy;
            }

            @Override
            public LocalDateTime getCreatedAt() {
                return createdAt;
            }

            @Override
            public LocalDateTime getUpdatedAt() {
                return createdAt;
            }

            @Override
            public String getTags() {
                return tags;
            }

            @Override
            public String getLessonPictureUrl() {
                return null;
            }

            @Override
            public String getStatus() {
                return status;
            }
            @Override
            public LocalDateTime getDeletedAt() {
                return createdAt;
            }
        };
    }
}
