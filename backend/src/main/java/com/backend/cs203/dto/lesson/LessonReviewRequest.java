package com.backend.cs203.dto.lesson;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LessonReviewRequest {

    @NotBlank(message = "title must not be blank")
    private String title;

    @NotBlank(message = "action must not be blank")
    @Pattern(regexp = "approve|reject", message = "action must be 'approve' or 'reject'")
    private String action;
}