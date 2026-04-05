package com.backend.cs203.service;

import com.backend.cs203.dto.quiz.QuizResultDTO;

public interface QuizService {
    
    public void saveResult(String username, QuizResultDTO dto);

}
