package com.backend.cs203.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.QuizResultService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz-result")
@RequiredArgsConstructor
public class QuizResultController {

    private final QuizResultService quizResultService;

    @PostMapping
    public ResponseEntity<Void> saveResult(
        @RequestBody QuizResultDTO dto,
        Authentication authentication
    ) {
        quizResultService.saveResult(authentication.getName(), dto);
        return ResponseEntity.ok().build();
    }
}
