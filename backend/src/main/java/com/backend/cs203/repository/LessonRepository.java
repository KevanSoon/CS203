package com.backend.cs203.repository;

import java.util.List;

import com.backend.cs203.dto.lesson.*;
import com.backend.cs203.entity.Lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query(value = "SELECT title, description, created_at FROM lesson WHERE status='approved' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllLessons();

    @Query(value = "SELECT title, description, status, created_at FROM lesson WHERE status IN ('pending','rejected') AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonApplicationDTO> findAllLessonApplications();

    @Query(value = "SELECT title, description, created_at FROM lesson WHERE status='pending' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllPendingLessonApplications();



}