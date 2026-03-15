package com.backend.cs203.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonSummaryResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.repository.ReviewRepository;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.LessonService;

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

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;


    // ===== GET /api/lesson/ (requires USER role) =====

    @Test
    void getAllAvailableLessons_withUserRole_returns200() throws Exception {
        LessonSummaryResponse dto = new LessonSummaryResponse(1, "Test Lesson", "A test lesson", "author", LocalDateTime.now(), "java", null);
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
    void getUserCreatedLessons_userNotFound_returns500() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/user-lessons/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is5xxServerError());
    }

    // ===== GET /api/lesson/applications/ (requires ROOT role) =====

    @Test
    void getAllLessonApplications_withRootRole_returns200() throws Exception {
        LessonApplicationDTO dto = createApplicationDTO("Pending Lesson", "A lesson", "author", LocalDateTime.now(), "java", "pending");
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
    void getLessonPage_lessonNotFound_returns500() throws Exception {
        when(lessonService.getLessonPage("Nonexistent"))
                .thenThrow(new RuntimeException("Lesson not found"));

        mockMvc.perform(get("/api/lesson/page").param("title", "Nonexistent")
                        .with(user("testuser").roles("USER")))
                .andExpect(status().is5xxServerError());
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
                "Pending Lesson", "A lesson", "adminuser", LocalDateTime.now(), "java", "pending");

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
    void getUserCreatedLessonApplications_userNotFound_returns500() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/user-applications/").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is5xxServerError());

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
    void getAdminLessonPage_userNotFound_returns500() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/lesson/admin/page").param("title", "My Lesson")
                        .with(user("adminuser").roles("ADMIN")))
                .andExpect(status().is5xxServerError());

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
    void getRootLessonPage_lessonNotFound_returns500() throws Exception {
        when(lessonService.getRootLessonApplicationPage("Ghost Lesson"))
                .thenThrow(new RuntimeException("Lesson application not found"));

        mockMvc.perform(get("/api/lesson/root/page").param("title", "Ghost Lesson")
                        .with(user("root").roles("ROOT")))
                .andExpect(status().is5xxServerError());
    }

    // ===== Helper methods =====

    private LessonApplicationDTO createApplicationDTO(String title, String description, String createdBy,
                                                       LocalDateTime createdAt, String tags, String status) {
        return new LessonApplicationDTO() {
            @Override public Integer getId() { return 1; }
            @Override public String getTitle() { return title; }
            @Override public String getDescription() { return description; }
            @Override public String getCreatedBy() { return createdBy; }
            @Override public LocalDateTime getCreatedAt() { return createdAt; }
            @Override public String getTags() { return tags; }
            @Override public String getLessonPictureUrl() { return null; }
            @Override public String getStatus() { return status; }
        };
    }
}
