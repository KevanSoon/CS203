package com.backend.cs203.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.cs203.repository.QuizRepository;
import com.backend.cs203.entity.Quiz;

@Service
public class QuizService {
    @Autowired
    private QuizRepository quizRepository;
    
    public List<Quiz> getQuizzesByChapter(int chapterId) {
        return quizRepository.findByChapterId(chapterId);
    }
}
