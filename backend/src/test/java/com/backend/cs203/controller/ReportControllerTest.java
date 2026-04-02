package com.backend.cs203.controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.report.ReportCreateDTO;
import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.ReportService;


@WebMvcTest(ReportController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportService reportService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;


    @Test
    void createReport_userAuthenticated_returns200() throws Exception {
        // Arrange
        User userEntity = User.builder().id(7).username("testuser").build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(userEntity));
        doNothing().when(reportService).createReport(any(ReportCreateDTO.class), any(User.class));

        String requestBody = """
            {
                "title": "Broken card",
                "description": "The card content is incorrect",
                "status": "reported",
                "type": "high",
                "lessonId": 10,
                "chapterId": 5
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/report/user")
                        .with(user("testuser").roles("USER"))
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isOk());

        verify(reportService).createReport(any(ReportCreateDTO.class), eq(userEntity));
    }

    @Test
    void createReport_userNotFound_returns401() throws Exception {
        // Arrange
        when(userRepository.findByUsername("missinguser")).thenReturn(Optional.empty());

        String requestBody = """
            {
                "title": "Broken card",
                "description": "The card content is incorrect",
                "status": "reported",
                "type": "high",
                "lessonId": 10,
                "chapterId": 5
            }
            """;

        // Act & Assert
        mockMvc.perform(post("/api/report/user")
                        .with(user("missinguser").roles("USER"))
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isUnauthorized());

        verify(reportService, never()).createReport(any(ReportCreateDTO.class), any(User.class));
    }

    @Test
    void createReport_unauthenticated_returns401() throws Exception {
        String requestBody = """
            {
                "title": "Broken card",
                "description": "The card content is incorrect",
                "status": "reported",
                "type": "high",
                "lessonId": 10,
                "chapterId": 5
            }
            """;

        mockMvc.perform(post("/api/report/user")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isUnauthorized());

        verify(reportService, never()).createReport(any(ReportCreateDTO.class), any(User.class));
    }

    @Test
    void createReport_invalidJson_returns400() throws Exception {
        String invalidJson = "{ invalid json }";
        mockMvc.perform(post("/api/report/user")
                        .with(user("testuser").roles("USER"))
                        .contentType("application/json")
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReport_emptyBody_returns400() throws Exception {
        mockMvc.perform(post("/api/report/user")
                        .with(user("testuser").roles("USER"))
                        .contentType("application/json")
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    // ===== GET /api/report/admin =====
    @Test
    void getUserCreatedLessonReports_adminAuthenticated_returns200() throws Exception {
        User userEntity = User.builder().id(7).username("adminuser").build();
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(userEntity));
        when(reportService.getUserCreatedLessonReports(7)).thenReturn(List.of(sampleDto(1, "Broken Card")));

        mockMvc.perform(get("/api/report/admin").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Broken Card"))
                .andExpect(jsonPath("$[0].status").value("reported"))
                .andExpect(jsonPath("$[0].type").value("high"))
                .andExpect(jsonPath("$[0].reportedBy").value("alice"))
                .andExpect(jsonPath("$[0].lessonTitle").value("Java Basics"))
                .andExpect(jsonPath("$[0].chapterTitle").value("Variables"));

        verify(reportService).getUserCreatedLessonReports(7);
    }

    @Test
    void getUserCreatedLessonReports_noReports_returnsEmptyList() throws Exception {
        User userEntity = User.builder().id(7).username("adminuser").build();
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.of(userEntity));
        when(reportService.getUserCreatedLessonReports(7)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/report/admin").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(reportService).getUserCreatedLessonReports(7);
    }

    @Test
    void getUserCreatedLessonReports_userNotFound_returns401() throws Exception {
        when(userRepository.findByUsername("adminuser")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/report/admin").with(user("adminuser").roles("ADMIN")))
                .andExpect(status().isUnauthorized());

        verify(reportService, never()).getUserCreatedLessonReports(anyInt());
    }

    @Test
    void getUserCreatedLessonReports_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/report/admin"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getUserCreatedLessonReports_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/report/admin").with(user("user1").roles("USER")))
                .andExpect(status().isForbidden());
    }

    // ===== GET /api/report/root =====
    @Test
    void getAllReportsForRoot_rootAuthenticated_returns200() throws Exception {
        when(reportService.getAllLessonReportsForRoot()).thenReturn(List.of(sampleDto(1, "Broken Card")));

        mockMvc.perform(get("/api/report/root").with(user("rootuser").roles("ROOT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Broken Card"))
                .andExpect(jsonPath("$[0].status").value("reported"))
                .andExpect(jsonPath("$[0].type").value("high"))
                .andExpect(jsonPath("$[0].reportedBy").value("alice"))
                .andExpect(jsonPath("$[0].lessonTitle").value("Java Basics"))
                .andExpect(jsonPath("$[0].chapterTitle").value("Variables"));
    }

    @Test
    void getAllReportsForRoot_noReports_returnsEmptyList() throws Exception {
        when(reportService.getAllLessonReportsForRoot()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/report/root").with(user("rootuser").roles("ROOT")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getAllReports_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/report/root"))
                .andExpect(status().isUnauthorized());
    }

    private ReportDTO sampleDto(Integer id, String title) {
        return new ReportDTO() {
            @Override
            public Integer getId() {
                return id;
            }

            @Override
            public String getTitle() {
                return title;
            }

            @Override
            public String getDescription() {
                return "Sample description";
            }

            @Override
            public String getStatus() {
                return "reported";
            }

            @Override
            public String getType() {
                return "high";
            }

            @Override
            public String getReportedBy() {
                return "alice";
            }

            @Override
            public String getLessonTitle() {
                return "Java Basics";
            }

            @Override
            public String getChapterTitle() {
                return "Variables";
            }

            @Override
            public String getRemarks() {
                return "Needs review";
            }

            @Override
            public String getLastUpdate() {
                return "root";
            }

            @Override
            public LocalDateTime getCreatedAt() {
                return LocalDateTime.of(2026, 3, 6, 10, 0);
            }

            @Override
            public LocalDateTime getUpdatedAt() {
                return LocalDateTime.of(2026, 3, 6, 11, 0);
            }

            @Override
            public LocalDateTime getLessonDeletedAt() {
                return LocalDateTime.of(2026, 3, 6, 11, 0);
            }
        };
    }
    // ===== PATCH /api/report/root =====

    @Test
    void updateReportStatus_rootAuthenticated_returns204() throws Exception {
        doNothing().when(reportService).updateReportStatus(10, "closed");

        mockMvc.perform(
                patch("/api/report/root/status")
                        .param("reportId", "10")
                        .param("status", "closed")
                        .with(user("rootuser").roles("ROOT"))
        ).andExpect(status().isNoContent());

        verify(reportService).updateReportStatus(10, "closed");
    }

    @Test
    void updateReportStatus_unauthenticated_returns401() throws Exception {
        mockMvc.perform(
                patch("/api/report/root/status")
                        .param("reportId", "10")
                        .param("status", "closed")
        ).andExpect(status().isUnauthorized());
    }

    @Test
    void updateReportStatus_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(
                patch("/api/report/root/status")
                        .param("reportId", "10")
                        .param("status", "closed")
                        .with(user("user1").roles("USER"))
        ).andExpect(status().isForbidden());
    }

    @Test
    void updateReportStatus_serviceThrows_returns400() throws Exception {
        doThrow(new RuntimeException("Report not found"))
                .when(reportService).updateReportStatus(999, "closed");

        mockMvc.perform(
                patch("/api/report/root/status")
                        .param("reportId", "999")
                        .param("status", "closed")
                        .with(user("rootuser").roles("ROOT"))
        ).andExpect(status().isBadRequest());
    }

    @Test
    void updateReportStatus_invalidReportId_returns400() throws Exception {
        mockMvc.perform(patch("/api/report/root/status")
                        .param("reportId", "abc")
                        .param("status", "closed")
                        .with(user("rootuser").roles("ROOT"))
                    ).andExpect(status().isBadRequest());
    }

    // ===== PATCH /api/report/root/suspend =====

    @Test
    void updateReportStatusAndSuspendLesson_rootAuthenticated_returns204() throws Exception {
        doNothing().when(reportService).updateReportStatusAndSuspendLesson(10, "resolved");

        mockMvc.perform(
                patch("/api/report/root/suspend")
                        .param("reportId", "10")
                        .param("status", "resolved")
                        .with(user("rootuser").roles("ROOT"))
        ).andExpect(status().isNoContent());

        verify(reportService).updateReportStatusAndSuspendLesson(10, "resolved");
    }

    @Test
    void updateReportStatusAndSuspendLesson_unauthenticated_returns401() throws Exception {
        mockMvc.perform(
                patch("/api/report/root/suspend")
                        .param("reportId", "10")
                        .param("status", "resolved")
        ).andExpect(status().isUnauthorized());
    }

    @Test
    void updateReportStatusAndSuspendLesson_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(
                patch("/api/report/root/suspend")
                        .param("reportId", "10")
                        .param("status", "resolved")
                        .with(user("user1").roles("USER"))
        ).andExpect(status().isForbidden());
    }

    @Test
    void updateReportStatusAndSuspendLesson_serviceThrows_returns401() throws Exception {
        doThrow(new RuntimeException("Report not found"))
                .when(reportService).updateReportStatusAndSuspendLesson(999, "resolved");

        mockMvc.perform(
                patch("/api/report/root/suspend")
                        .param("reportId", "999")
                        .param("status", "resolved")
                        .with(user("rootuser").roles("ROOT"))
        ).andExpect(status().isBadRequest());
    }

    @Test
    void updateReportStatusAndSuspendLesson_invalidReportId_returns400() throws Exception {
        mockMvc.perform(patch("/api/report/root/suspend")
                        .param("reportId", "abc")
                        .param("status", "resolved")
                        .with(user("rootuser").roles("ROOT"))
                    ).andExpect(status().isBadRequest());
    }
    // ===== PATCH /api/report/admin/remarks =====

    @Test
    void updateReportRemarks_adminAuthenticated_returns204() throws Exception {
        doNothing().when(reportService).updateReportRemarks(10, "Reviewed and fixed");

        mockMvc.perform(
                patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "Reviewed and fixed")
                        .with(user("adminuser").roles("ADMIN"))
        ).andExpect(status().isNoContent());

        verify(reportService).updateReportRemarks(10, "Reviewed and fixed");
    }

    @Test
    void updateReportRemarks_unauthenticated_returns401() throws Exception {
        mockMvc.perform(
                patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "Reviewed and fixed")
        ).andExpect(status().isUnauthorized());
    }

    @Test
    void updateReportRemarks_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(
                patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "Reviewed and fixed")
                        .with(user("user1").roles("USER"))
        ).andExpect(status().isForbidden());
    }

    @Test
    void updateReportRemarks_withRootRole_deniesAccess() throws Exception {
        mockMvc.perform(
                patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "Reviewed and fixed")
                        .with(user("rootuser").roles("ROOT"))
        ).andExpect(status().isForbidden());
    }

    @Test
    void updateReportRemarks_serviceThrows_returns400() throws Exception {
        doThrow(new RuntimeException("Report not found"))
                .when(reportService).updateReportRemarks(999, "Reviewed and fixed");

        mockMvc.perform(
            patch("/api/report/admin/remarks")
                        .param("reportId", "999")
                        .param("remarks", "Reviewed and fixed")
                .with(user("adminuser").roles("ADMIN"))
        ).andExpect(status().isBadRequest());
    }

    @Test
    void updateReportRemarks_emptyRemarks_stillCallsService() throws Exception {
        mockMvc.perform(patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "")
                        .with(user("adminuser").roles("ADMIN"))
        ).andExpect(status().isNoContent());

        verify(reportService).updateReportRemarks(10, "");
    }

    @Test
    void updateReportRemarks_serviceNotCalled_whenForbidden() throws Exception {
        mockMvc.perform(
                patch("/api/report/admin/remarks")
                        .param("reportId", "10")
                        .param("remarks", "test")
                        .with(user("user1").roles("USER"))
        ).andExpect(status().isForbidden());

        verify(reportService, never()).updateReportRemarks(anyInt(), anyString());
    }

    // ===== GET /api/report/root =====

    @Test
    void getAllReportsForRoot_withUserRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/report/root").with(user("user1").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllReportsForRoot_withAdminRole_deniesAccess() throws Exception {
        mockMvc.perform(get("/api/report/root")
                .with(user("admin1").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

}
