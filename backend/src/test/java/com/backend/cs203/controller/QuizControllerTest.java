package com.backend.cs203.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.QuizResultService;
import com.backend.cs203.service.QuizService;
import com.backend.cs203.service.UserProgressService;
import com.backend.cs203.exception.Exceptions.AuthException;

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
    @Test
    void saveResult_callsServicesAndReturnsOk() {
        QuizResultService quizResultService = mock(QuizResultService.class);
        UserProgressService userProgressService = mock(UserProgressService.class);
        QuizResultController controller = new QuizResultController(quizResultService, userProgressService);

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        QuizResultDTO dto = mock(QuizResultDTO.class);
        when(dto.getChapterId()).thenReturn(42);

        ResponseEntity<Void> response = controller.saveResult(dto, auth);

        assertEquals(200, response.getStatusCode().value());
        verify(quizResultService).saveResult("testuser", dto);
        verify(userProgressService).checkLessonCompletionForChapter("testuser", 42);
    }


}