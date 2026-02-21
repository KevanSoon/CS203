package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.entity.Chapter;

public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    @Query(value = "SELECT * FROM chapter ORDER BY created_at DESC", nativeQuery = true)
    List<Chapter> findAllChapters();

    @Query(value = "SELECT * FROM chapter WHERE lesson_id = :lessonId", nativeQuery = true)
    List<Chapter> findByLessonId(@Param("lessonId") Integer lessonId);
}
