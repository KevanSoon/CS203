package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.QuizResult;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Integer> {
    Optional<QuizResult> findByUserIdAndChapterId(Integer userId, Integer chapterId);

    /** Batch: get all chapter IDs where a user has completed the quiz. */
    @Query(value = "SELECT DISTINCT chapter_id FROM quiz_result WHERE user_id = :userId AND score=100",
           nativeQuery = true)
    List<Integer> findCompletedChapterIdsByUserId(@Param("userId") Integer userId);
}