package com.backend.cs203.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.entity.QuizResult;
import com.backend.cs203.repository.QuizResultRepository;

@Service
public class QuizResultService {
    @Autowired
    private QuizResultRepository quizResultRepository;

    public void saveResult(Integer userId, QuizResultDTO dto) {
        Optional<QuizResult> existing = quizResultRepository
            .findByUserIdAndChapterId(userId, dto.getChapterId());

        if (existing.isPresent()) {
            QuizResult result = existing.get();
            // Always increment attempts
            result.setAttempts(result.getAttempts() + 1);
            // Only update score if new score is higher
            if (dto.getScore() > result.getScore()) {
                result.setScore(dto.getScore());
            }
            quizResultRepository.save(result);
        } else {
            // First attempt
            QuizResult result = new QuizResult();
            result.setUserId(userId);
            result.setChapterId(dto.getChapterId());
            result.setScore(dto.getScore());
            result.setAttempts(1);
            quizResultRepository.save(result);
        }
    }
}