package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.Card;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByLessonId(Long lessonId);
    List<Card> findByChapterId(Long chapterId);
    Optional<Card> findByLessonIdAndChapterId(Long lessonId, Long chapterId);
}
