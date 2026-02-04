package com.backend.cs203.repository;

import java.util.List;
import com.backend.cs203.dto.lesson.LessonsSummaryDTO;
import com.backend.cs203.entity.Lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query(value = "SELECT title, description, created_at FROM lesson WHERE status='approved' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonsSummaryDTO> findAllLessons();

}