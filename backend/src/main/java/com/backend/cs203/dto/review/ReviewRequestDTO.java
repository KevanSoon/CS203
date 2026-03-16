package com.backend.cs203.dto.review;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private int rating;
    private String feedback;
}