package com.backend.cs203.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.cs203.repository.QuizResultRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.dto.quiz.QuizResultDTO;
import com.backend.cs203.entity.QuizResult;
import com.backend.cs203.entity.User;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.service.QuizService;

@Service
public class QuizServiceImpl implements QuizService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;
    
    public void saveResult(String username, QuizResultDTO dto) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AuthException("User not found"));

        Integer userId = user.getId();

        Optional<QuizResult> existing = quizResultRepository
            .findByUserIdAndChapterId(userId, dto.getChapterId());

        if (existing.isPresent()) {
            QuizResult result = existing.get();
            result.setAttempts(result.getAttempts() + 1);
            if (dto.getScore() > result.getScore()) {
                result.setScore(dto.getScore());
            }
            quizResultRepository.save(result);
        } else {
            QuizResult result = new QuizResult();
            result.setUserId(userId);
            result.setChapterId(dto.getChapterId());
            result.setScore(dto.getScore());
            result.setAttempts(1);
            quizResultRepository.save(result);
        }
    }
}
