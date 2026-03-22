package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.UserLessonProgress;
import com.backend.cs203.entity.UserLessonProgress.ProgressStatus;
import com.backend.cs203.entity.UserLessonProgressId;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, UserLessonProgressId> {

    List<UserLessonProgress> findByUserId(Integer userId);

    Optional<UserLessonProgress> findByUserIdAndLessonId(Integer userId, Integer lessonId);

    /** Count all attempts (any status) across approved lessons created by the given admin. */
    @Query(value = """
            SELECT COUNT(*) FROM user_lesson_progress ulp
            JOIN lesson l ON ulp.lesson_id = l.id
            WHERE l.created_by_id = :adminId AND l.status = 'approved' AND l.deleted_at IS NULL
            """, nativeQuery = true)
    long countAttemptsByAdminId(@Param("adminId") Integer adminId);

    /** Count completed attempts across approved lessons created by the given admin. */
    @Query(value = """
            SELECT COUNT(*) FROM user_lesson_progress ulp
            JOIN lesson l ON ulp.lesson_id = l.id
            WHERE l.created_by_id = :adminId AND l.status = 'approved' AND ulp.status = 'completed' AND l.deleted_at IS NULL
            """, nativeQuery = true)
    long countCompletionsByAdminId(@Param("adminId") Integer adminId);
    long countByUserIdAndStatus(Integer userId, ProgressStatus status);

    void deleteByUserIdAndLessonId(Integer userId, Integer lessonId);
}
