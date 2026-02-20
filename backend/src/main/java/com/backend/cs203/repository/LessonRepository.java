package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    @Query(value = "SELECT title, description, created_by, created_at FROM lesson WHERE status='approved' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllLessons();

    @Query(value = " SELECT l.title AS title, l.description AS description, u.username AS createdBy, l.created_at AS createdAt FROM lesson l JOIN user u ON l.created_by = u.id WHERE l.created_by = :userId AND l.status = 'approved' AND l.deleted_at IS NULL ORDER BY l.created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findUserCreatedLessons(@Param("userId") Integer userId);

    @Query(value = "SELECT title, description, status, created_by, created_at FROM lesson WHERE status IN ('rejected','approved') AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonApplicationDTO> findAllLessonApplications();

    @Query(value = "SELECT title, description, created_by, created_at FROM lesson WHERE status='pending' AND deleted_at IS NULL ORDER BY created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllPendingLessonApplications();

}