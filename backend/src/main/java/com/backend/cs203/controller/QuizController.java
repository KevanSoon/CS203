package com.backend.cs203.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.service.QuizService;
import com.backend.cs203.entity.Quiz;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {
    @Autowired
    private QuizService quizService;

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<Quiz>> getQuizzesByChapter(@PathVariable int chapterId) {
        return ResponseEntity.ok(quizService.getQuizzesByChapter(chapterId));
    }
}