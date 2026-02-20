package com.backend.cs203.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.entity.Quiz;

public interface QuizRepository extends  JpaRepository<Quiz, Integer> {
    @Query(value = "SELECT title, question, options, correct_answer, card_id, created_at FROM quiz ORDER BY created_at DESC", nativeQuery = true)
    List<QuizDTO> findAllQuizzes();
    
}

