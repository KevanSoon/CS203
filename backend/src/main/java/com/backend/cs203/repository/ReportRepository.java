package com.backend.cs203.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.dto.report.ReportDTO;
import com.backend.cs203.entity.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {

    String SUMMARY = " SELECT r.id AS id, r.title AS title, r.description AS description,r.status AS status, r.type AS type, r.remarks as remarks, u.username AS reportedBy,l.title AS lessonTitle,l.deleted_at AS lessonDeletedAt, c.title AS chapterTitle,r.created_at AS createdAt,r.updated_at AS updatedAt, r.last_update as lastUpdate ";

    @Query(value = SUMMARY + "FROM report r INNER JOIN user u ON r.reported_by = u.id INNER JOIN lesson l on r.lesson_id = l.id LEFT JOIN chapter c on r.chapter_id = c.id", nativeQuery = true)
    List<ReportDTO> findAllLessonReportsForRoot();

    @Query(value = SUMMARY + "FROM report r INNER JOIN user u ON r.reported_by = u.id INNER JOIN lesson l on r.lesson_id = l.id LEFT JOIN chapter c on r.chapter_id = c.id WHERE l.created_by_id = :userId AND r.status = 'unresolved'", nativeQuery = true)
    List<ReportDTO> findUserCreatedLessonReports(@Param("userId") Integer userId);

    @Query(value = "SELECT * FROM report WHERE lesson_id = :lessonId AND status != 'closed'", nativeQuery = true)
    List<Report> findNotClosedReportsByLessonId(@Param("lessonId") Integer lessonId);

}
