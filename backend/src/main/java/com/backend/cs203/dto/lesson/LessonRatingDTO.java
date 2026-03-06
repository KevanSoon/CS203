package com.backend.cs203.dto.lesson;


import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class LessonRatingDTO {
   private Integer lessonId;
   private Double averageRating;
   private Integer ratingCount;
   private boolean hasReviewed;
}

