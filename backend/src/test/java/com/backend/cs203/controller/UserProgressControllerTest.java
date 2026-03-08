package com.backend.cs203.controller;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.progress.ChapterProgressDTO;
import com.backend.cs203.dto.progress.DashboardProgressDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.UserProgressService;

@WebMvcTest(UserProgressController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class UserProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserProgressService userProgressService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ===== GET /api/progress/dashboard =====

    @Test
    void getDashboard_authenticatedUser_returns200WithProgressList() throws Exception {
        DashboardProgressDTO dto = new DashboardProgressDTO(1, "in_progress", 10, 5, 50.0);
        when(userProgressService.getDashboard("testuser")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/progress/dashboard").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lessonId").value(1))
                .andExpect(jsonPath("$[0].status").value("in_progress"))
                .andExpect(jsonPath("$[0].totalItems").value(10))
                .andExpect(jsonPath("$[0].completedItems").value(5))
                .andExpect(jsonPath("$[0].progressPercent").value(50.0));

        verify(userProgressService).getDashboard("testuser");
    }

    @Test
    void getDashboard_emptyProgressList_returns200WithEmptyArray() throws Exception {
        when(userProgressService.getDashboard("testuser")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/progress/dashboard").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getDashboard_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/progress/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getDashboard_multipleItems_returnsAll() throws Exception {
        DashboardProgressDTO dto1 = new DashboardProgressDTO(1, "completed", 5, 5, 100.0);
        DashboardProgressDTO dto2 = new DashboardProgressDTO(2, "not_started", 8, 0, 0.0);
        when(userProgressService.getDashboard("testuser")).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/api/progress/dashboard").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].status").value("completed"))
                .andExpect(jsonPath("$[1].status").value("not_started"));
    }

    // ===== GET /api/progress/lesson/{lessonId} =====

    @Test
    void getLessonProgress_authenticatedUser_returns200WithDetail() throws Exception {
        ChapterProgressDTO chapterDTO = new ChapterProgressDTO(
                10, "Chapter 1", 5, 3, true, false, 6, 3, 50.0);
        LessonProgressDTO progressDTO = new LessonProgressDTO(
                1, "in_progress", List.of(chapterDTO), 6, 3, 50.0);
        when(userProgressService.getLessonProgress("testuser", 1)).thenReturn(progressDTO);

        mockMvc.perform(get("/api/progress/lesson/1").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lessonId").value(1))
                .andExpect(jsonPath("$.status").value("in_progress"))
                .andExpect(jsonPath("$.totalItems").value(6))
                .andExpect(jsonPath("$.completedItems").value(3))
                .andExpect(jsonPath("$.progressPercent").value(50.0))
                .andExpect(jsonPath("$.chapters[0].chapterId").value(10))
                .andExpect(jsonPath("$.chapters[0].title").value("Chapter 1"))
                .andExpect(jsonPath("$.chapters[0].totalCards").value(5))
                .andExpect(jsonPath("$.chapters[0].completedCards").value(3))
                .andExpect(jsonPath("$.chapters[0].hasQuiz").value(true))
                .andExpect(jsonPath("$.chapters[0].quizCompleted").value(false));

        verify(userProgressService).getLessonProgress("testuser", 1);
    }

    @Test
    void getLessonProgress_lessonNotStarted_returnsNotStartedStatus() throws Exception {
        LessonProgressDTO progressDTO = new LessonProgressDTO(
                2, "not_started", Collections.emptyList(), 0, 0, 0.0);
        when(userProgressService.getLessonProgress("testuser", 2)).thenReturn(progressDTO);

        mockMvc.perform(get("/api/progress/lesson/2").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("not_started"))
                .andExpect(jsonPath("$.chapters").isArray())
                .andExpect(jsonPath("$.chapters").isEmpty());
    }

    @Test
    void getLessonProgress_lessonNotFound_returns500() throws Exception {
        when(userProgressService.getLessonProgress("testuser", 999))
                .thenThrow(new RuntimeException("Lesson not found"));

        mockMvc.perform(get("/api/progress/lesson/999").with(user("testuser").roles("USER")))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void getLessonProgress_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/progress/lesson/1"))
                .andExpect(status().isUnauthorized());
    }

    // ===== POST /api/progress/card/complete =====

    @Test
    void markCardComplete_validRequest_returns200() throws Exception {
        mockMvc.perform(post("/api/progress/card/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cardId\": 42}")
                        .with(user("testuser").roles("USER")))
                .andExpect(status().isOk());

        verify(userProgressService).markCardComplete("testuser", 42);
    }

    @Test
    void markCardComplete_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/progress/card/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cardId\": 42}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void markCardComplete_cardNotFound_returns500() throws Exception {
        org.mockito.Mockito.doThrow(new RuntimeException("Card not found"))
                .when(userProgressService).markCardComplete(eq("testuser"), eq(9999));

        mockMvc.perform(post("/api/progress/card/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cardId\": 9999}")
                        .with(user("testuser").roles("USER")))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void markCardComplete_serviceCalledWithAuthenticatedUsername() throws Exception {
        mockMvc.perform(post("/api/progress/card/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cardId\": 100}")
                        .with(user("alice").roles("USER")))
                .andExpect(status().isOk());

        verify(userProgressService).markCardComplete("alice", 100);
    }
}
