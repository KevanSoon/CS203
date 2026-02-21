package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    @Query(value = "SELECT * FROM lesson WHERE title = :title AND status = 'approved' AND deleted_at IS NULL", nativeQuery = true)
    Optional<Lesson> findByTitle(@Param("title") String title);

    @Query(value = "SELECT l.title AS title, l.description AS description, u.username AS createdBy, l.created_at AS createdAt FROM lesson l JOIN user u ON l.created_by_id = u.id WHERE l.status = 'approved' AND l.deleted_at IS NULL ORDER BY l.created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllLessons();

    @Query(value = "SELECT l.title AS title, l.description AS description, u.username AS createdBy, l.created_at AS createdAt FROM lesson l JOIN user u ON l.created_by_id = u.id WHERE l.created_by_id = :userId AND l.status = 'approved' AND l.deleted_at IS NULL ORDER BY l.created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findUserCreatedLessons(@Param("userId") Integer userId);

    @Query(value = "SELECT l.title AS title, l.description AS description, l.status AS status, u.username AS createdBy, l.created_at AS createdAt FROM lesson l JOIN user u ON l.created_by_id = u.id WHERE l.status IN ('rejected','approved') AND l.deleted_at IS NULL ORDER BY l.created_at DESC", nativeQuery = true)
    List<LessonApplicationDTO> findAllLessonApplications();

    @Query(value = "SELECT l.title AS title, l.description AS description, u.username AS createdBy, l.created_at AS createdAt FROM lesson l JOIN user u ON l.created_by_id = u.id WHERE l.status = 'pending' AND l.deleted_at IS NULL ORDER BY l.created_at DESC", nativeQuery = true)
    List<LessonSummaryDTO> findAllPendingLessonApplications();

}