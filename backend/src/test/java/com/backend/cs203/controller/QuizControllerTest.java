package com.backend.cs203.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.QuizService;
import com.backend.cs203.service.UserProgressService;

@WebMvcTest(QuizController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizService quizService;

    @MockitoBean
    private UserProgressService userProgressService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void saveResult_authenticated_returnsOk() throws Exception {
        QuizResultDTO dto = new QuizResultDTO();
        dto.setChapterId(42);
        dto.setScore(90.0);

        // Mock the service methods
        // No need to mock return value for void methods, just verify invocation if needed

        mockMvc.perform(
                post("/api/quiz")
                    .with(user("testuser").roles("USER"))
                    .contentType("application/json")
                    .content("{\"chapterId\":42,\"score\":90}")
            )
            .andExpect(status().isOk());
    }


}