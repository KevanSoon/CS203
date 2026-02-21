package com.backend.cs203.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.repository.QuizRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;

    public List<QuizDTO> getAllQuizzes() {
        return quizRepository.findAllQuizzes()
                .stream()
                .map(quiz -> new QuizDTO(quiz.getId(), quiz.getTitle(), quiz.getQuestion(), quiz.getOptions(), quiz.getCorrectAnswer()))
                .collect(Collectors.toList());
    }
}
