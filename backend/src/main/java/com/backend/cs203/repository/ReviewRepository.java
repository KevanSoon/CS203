package com.backend.cs203.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.backend.cs203.entity.Review;


public interface ReviewRepository extends JpaRepository<Review, Integer> {


   boolean existsByReviewedByIdAndLessonId(Integer userId, Integer lessonId);


   @Query("SELECT AVG(r.rating) FROM Review r WHERE r.lesson.id = :lessonId")
   Double findAverageRatingByLessonId(Integer lessonId);


   @Query("SELECT COUNT(r) FROM Review r WHERE r.lesson.id = :lessonId")
   Integer findRatingCountByLessonId(Integer lessonId);
}

