package com.backend.cs203.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.service.QuizResultService;
import com.backend.cs203.service.UserProgressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/quiz-result")
@RequiredArgsConstructor
public class QuizResultController {

    private final QuizResultService quizResultService;
    private final UserProgressService userProgressService;

    @PostMapping
    public ResponseEntity<Void> saveResult(
        @RequestBody QuizResultDTO dto,
        Authentication authentication
    ) {
        String username = authentication.getName();
        quizResultService.saveResult(username, dto);
        userProgressService.checkLessonCompletionForChapter(username, dto.getChapterId());
        return ResponseEntity.ok().build();
    }
}
