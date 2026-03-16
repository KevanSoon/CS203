package com.backend.cs203.dto.review;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewDTO {

    private Integer lessonId;
    private Integer userId;
    private int rating;
    private String feedback;
}