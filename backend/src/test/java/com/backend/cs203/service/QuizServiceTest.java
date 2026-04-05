package com.backend.cs203.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.entity.QuizResult;
import com.backend.cs203.entity.User;
import com.backend.cs203.service.impl.QuizServiceImpl;

import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.repository.QuizResultRepository;

@ExtendWith(MockitoExtension.class)
public class QuizServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock 
    private QuizResultRepository quizResultRepository;
    
    @InjectMocks
    private QuizServiceImpl quizService;

    @Test
    void saveResult_validUser_savesResult() {
        User user = User.builder().id(1).username("testuser").build();
        
        QuizResultDTO dto = new QuizResultDTO();
        dto.setScore(80.0);
        dto.setChapterId(1);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        quizService.saveResult("testuser", dto);

        verify(quizResultRepository).save(any(QuizResult.class));
    }

    @Test
    void saveResult_userNotFound_throwsException() {
        QuizResultDTO dto = new QuizResultDTO();

        when(userRepository.findByUsername("missinguser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, 
            () -> quizService.saveResult("missinguser", dto));
    }
}
