package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.entity.Card;

public interface CardRepository extends  JpaRepository<Card, Integer> {
    @Query(value = "SELECT front, back, display_order, chapter_id, created_at FROM card ORDER BY created_at DESC", nativeQuery = true)
    List<CardDTO> findAllCards();
    
}
