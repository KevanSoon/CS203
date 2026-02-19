package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.entity.Chapter;

public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    @Query(value = "SELECT title, description, lesson_id, created_at FROM chapter ORDER BY created_at DESC", nativeQuery = true)
    List<ChapterDTO> findAllChapters();

}