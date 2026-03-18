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

    @Query(value = "SELECT * FROM lesson WHERE title = :title AND deleted_at IS NULL", nativeQuery = true)
    Optional<Lesson> findByTitleNotDeleted(@Param("title") String title);

    @Query(value = "SELECT * FROM lesson WHERE title = :title AND created_by_id = :userId AND deleted_at IS NULL", nativeQuery = true)
    Optional<Lesson> findByTitleAndCreatedBy(@Param("title") String title, @Param("userId") Integer userId);

    @Query(value = """
            SELECT l.id AS id, l.title AS title, l.description AS description,
                   u.username AS createdBy, l.created_at AS createdAt,
                   GROUP_CONCAT(lt.tag_name ORDER BY lt.tag_name SEPARATOR ',') AS tags,
                   l.lesson_picture_url AS lessonPictureUrl, l.deleted_at AS deletedAt, l.status as status
            FROM lesson l
            JOIN user u ON l.created_by_id = u.id
            LEFT JOIN lesson_tagging lt ON lt.lesson_id = l.id AND lt.deleted_at IS NULL
            WHERE l.status IN ('approved','suspended')
            GROUP BY l.id, l.title, l.description, u.username, l.created_at, l.lesson_picture_url
            ORDER BY l.created_at DESC
            """, nativeQuery = true)
    List<LessonSummaryDTO> findAllLessons();

    @Query(value = """
            SELECT l.id AS id, l.title AS title, l.description AS description,
                   u.username AS createdBy, l.created_at AS createdAt, l.status AS status, l.deleted_at as deletedAt,
                   GROUP_CONCAT(lt.tag_name ORDER BY lt.tag_name SEPARATOR ',') AS tags,
                   l.lesson_picture_url AS lessonPictureUrl
            FROM lesson l
            JOIN user u ON l.created_by_id = u.id
            LEFT JOIN lesson_tagging lt ON lt.lesson_id = l.id AND lt.deleted_at IS NULL
            WHERE l.created_by_id = :userId AND l.status IN ('approved','suspended')
            GROUP BY l.id, l.title, l.description, u.username, l.created_at, l.lesson_picture_url
            ORDER BY l.created_at DESC
            """, nativeQuery = true)
    List<LessonApplicationDTO> findUserCreatedLessons(@Param("userId") Integer userId);

    @Query(value = """
            SELECT l.title AS title, l.description AS description, l.status AS status,
                   u.username AS createdBy, l.created_at AS createdAt,
                   GROUP_CONCAT(lt.tag_name ORDER BY lt.tag_name SEPARATOR ',') AS tags
            FROM lesson l
            JOIN user u ON l.created_by_id = u.id
            LEFT JOIN lesson_tagging lt ON lt.lesson_id = l.id AND lt.deleted_at IS NULL
            WHERE l.status IN ('rejected','approved') AND l.deleted_at IS NULL
            GROUP BY l.id, l.title, l.description, l.status, u.username, l.created_at
            ORDER BY l.created_at DESC
            """, nativeQuery = true)
    List<LessonApplicationDTO> findAllLessonApplications();

    @Query(value = """
            SELECT l.id AS id, l.title AS title, l.description AS description,
                   u.username AS createdBy, l.created_at AS createdAt,
                   GROUP_CONCAT(lt.tag_name ORDER BY lt.tag_name SEPARATOR ',') AS tags,
                   l.lesson_picture_url AS lessonPictureUrl, l.status as status
            FROM lesson l
            JOIN user u ON l.created_by_id = u.id
            LEFT JOIN lesson_tagging lt ON lt.lesson_id = l.id AND lt.deleted_at IS NULL
            WHERE l.status = 'pending' AND l.deleted_at IS NULL
            GROUP BY l.id, l.title, l.description, u.username, l.created_at, l.lesson_picture_url
            ORDER BY l.created_at DESC
            """, nativeQuery = true)
    List<LessonSummaryDTO> findAllPendingLessonApplications();

    @Query(value = """
            SELECT l.id AS id, l.title AS title, l.description AS description,
                   l.status AS status, u.username AS createdBy, l.created_at AS createdAt,
                   GROUP_CONCAT(lt.tag_name ORDER BY lt.tag_name SEPARATOR ',') AS tags,
                   l.lesson_picture_url AS lessonPictureUrl
            FROM lesson l
            JOIN user u ON l.created_by_id = u.id
            LEFT JOIN lesson_tagging lt ON lt.lesson_id = l.id AND lt.deleted_at IS NULL
            WHERE l.created_by_id = :userId AND l.deleted_at IS NULL
            GROUP BY l.id, l.title, l.description, l.status, u.username, l.created_at, l.lesson_picture_url
            ORDER BY l.created_at DESC
            """, nativeQuery = true)
    List<LessonApplicationDTO> findUserCreatedLessonApplications(@Param("userId") Integer userId); // ← NEW

    @Query(value = "SELECT lt.tag_name FROM lesson_tagging lt WHERE lt.lesson_id = :lessonId AND lt.deleted_at IS NULL ORDER BY lt.tag_name", nativeQuery = true)
    List<String> findTagsByLessonId(@Param("lessonId") Integer lessonId);

    /**
     * Returns all existing tag names.
     */
    @Query(value = "SELECT name FROM tag ORDER BY name", nativeQuery = true)
    List<String> findAllTagNames();

    /**
     * Check if a lesson with the given title exists (any status, not deleted).
     */
    @Query(value = "SELECT COUNT(*) FROM lesson WHERE title = :title AND deleted_at IS NULL", nativeQuery = true)
    long countByTitleNotDeleted(@Param("title") String title);

    /** Count pending and approved lessons created by an admin (not deleted). */
    @Query(value = "SELECT COUNT(*) FROM lesson WHERE created_by_id = :userId AND status IN ('pending', 'approved') AND deleted_at IS NULL", nativeQuery = true)
    long countPendingAndApprovedByUserId(@Param("userId") Integer userId);

    /** Count published (approved) lessons created by an admin. */
    @Query(value = "SELECT COUNT(*) FROM lesson WHERE created_by_id = :userId AND status = 'approved' AND deleted_at IS NULL", nativeQuery = true)
    long countPublishedByUserId(@Param("userId") Integer userId);

}
