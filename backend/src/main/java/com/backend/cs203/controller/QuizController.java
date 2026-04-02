package com.backend.cs203.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;

import com.backend.cs203.service.QuizService;
import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.service.UserProgressService;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    @Autowired
    private QuizService quizService;

    @Autowired
    private UserProgressService userProgressService;


    @PostMapping
    public ResponseEntity<Void> saveResult(
        @RequestBody QuizResultDTO dto,
        Authentication authentication
    ) {
        String username = authentication.getName();
        quizService.saveResult(username, dto);
        userProgressService.checkLessonCompletionForChapter(username, dto.getChapterId());
        return ResponseEntity.ok().build();
    }
}