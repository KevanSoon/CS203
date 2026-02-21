package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.service.QuizService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quiz")
public class QuizController {
    
    private final QuizService quizService;

    @GetMapping("/")
    public ResponseEntity<List<QuizDTO>> getAllAvailableQuizzes() {
            return ResponseEntity.ok(quizService.getAllQuizzes());
}

}
