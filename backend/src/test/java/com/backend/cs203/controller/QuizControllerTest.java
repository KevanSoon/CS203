package com.backend.cs203.controller;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.QuizService;

@WebMvcTest(QuizController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QuizService quizService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void getQuizzesByChapter_authenticated_returnsQuizList() throws Exception {
        int chapterId = 5;
        List<Quiz> quizzes = List.of(new Quiz());
        when(quizService.getQuizzesByChapter(chapterId)).thenReturn(quizzes);

        mockMvc.perform(get("/api/quiz/chapter/{chapterId}", chapterId)
                .with(user("testuser").roles("USER")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }


}