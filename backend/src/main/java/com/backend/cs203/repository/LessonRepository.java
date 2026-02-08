package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query(value = "SELECT title, description, created_by, created_at FROM lesson WHERE status='approved' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllLessons();

    @Query(value = "SELECT title, description, created_by, created_at FROM lesson WHERE created_by=:createdBy AND status='approved' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findUserCreatedLessons(@Param("createdBy") String createdBy);

    @Query(value = "SELECT title, description, status, created_by, created_at FROM lesson WHERE status IN ('rejected','approved') AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonApplicationDTO> findAllLessonApplications();

    @Query(value = "SELECT title, description, created_by, created_at FROM lesson WHERE status='pending' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllPendingLessonApplications();

}