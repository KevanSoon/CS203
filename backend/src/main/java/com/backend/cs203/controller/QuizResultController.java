package com.backend.cs203.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.service.QuizResultService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/quiz-result")
public class QuizResultController {
    @Autowired
    private QuizResultService quizResultService;

    @PostMapping
    public ResponseEntity<Void> saveResult(
        QuizResultDTO dto,
        HttpServletRequest request
    ) {
        Integer userId = (Integer) request.getAttribute("userId");
        quizResultService.saveResult(userId, dto);
        return ResponseEntity.ok().build();
    }
}
