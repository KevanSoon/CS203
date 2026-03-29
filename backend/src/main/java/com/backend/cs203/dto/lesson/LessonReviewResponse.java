package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LessonReviewResponse {
    private Integer id;
    private Integer userId; 
    private String username;
    private String avatarUrl;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;
}
