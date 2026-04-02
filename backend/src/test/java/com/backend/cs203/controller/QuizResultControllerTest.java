package com.backend.cs203.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.service.QuizResultService;
import com.backend.cs203.service.UserProgressService;
import com.backend.cs203.controller.QuizResultController;

class QuizResultControllerTest {

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