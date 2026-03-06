package com.backend.cs203.controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.report.ReportDTO;
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

    // ===== GET /api/report/root =====

    @Test
    void getAllReports_rootAuthenticated_returns200() throws Exception {
        when(reportService.getAllLessonReports()).thenReturn(List.of(sampleDto(1, "Broken Card")));

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
    void getAllReports_noReports_returnsEmptyList() throws Exception {
        when(reportService.getAllLessonReports()).thenReturn(Collections.emptyList());

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
            public Integer getId() { return id; }

            @Override
            public String getTitle() { return title; }

            @Override
            public String getDescription() { return "Sample description"; }

            @Override
            public String getStatus() { return "reported"; }

            @Override
            public String getType() { return "high"; }

            @Override
            public String getReportedBy() { return "alice"; }

            @Override
            public String getLessonTitle() { return "Java Basics"; }

            @Override
            public String getChapterTitle() { return "Variables"; }

            @Override
            public LocalDateTime getCreatedAt() { return LocalDateTime.of(2026, 3, 6, 10, 0); }

            @Override
            public LocalDateTime getUpdatedAt() { return LocalDateTime.of(2026, 3, 6, 11, 0); }
        };
    }
}