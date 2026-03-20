package com.backend.cs203.dto.lesson;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LessonReviewResponse {
    private Integer id;
    private String username;
    private String avatarUrl;
    private Integer rating;
    private String feedback;
}
