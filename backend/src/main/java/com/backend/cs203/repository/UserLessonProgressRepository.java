package com.backend.cs203.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.cs203.entity.UserLessonProgress;
import com.backend.cs203.entity.UserLessonProgressId;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, UserLessonProgressId> {

    List<UserLessonProgress> findByUserId(Integer userId);

    Optional<UserLessonProgress> findByUserIdAndLessonId(Integer userId, Integer lessonId);

    void deleteByUserIdAndLessonId(Integer userId, Integer lessonId);
}
