package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.entity.Card;

public interface CardRepository extends JpaRepository<Card, Integer> {
    @Query(value = "SELECT * FROM card ORDER BY created_at DESC", nativeQuery = true)
    List<Card> findAllCards();

    @Query(value = "SELECT * FROM card WHERE chapter_id = :chapterId ORDER BY display_order ASC", nativeQuery = true)
    List<Card> findByChapterId(@Param("chapterId") Integer chapterId);
}
