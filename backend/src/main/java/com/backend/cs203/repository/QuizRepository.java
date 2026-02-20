package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.entity.Quiz;

public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    @Query(value = "SELECT * FROM quiz ORDER BY created_at DESC", nativeQuery = true)
    List<Quiz> findAllQuizzes();

    @Query(value = "SELECT * FROM quiz WHERE chapter_id = :chapterId", nativeQuery = true)
    List<Quiz> findByChapterId(@Param("chapterId") Integer chapterId);
}
