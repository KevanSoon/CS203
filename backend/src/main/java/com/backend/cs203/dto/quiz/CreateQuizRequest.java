package com.backend.cs203.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Quiz title is required")
    @Size(max = 200, message = "Quiz title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Quiz question is required")
    @Size(max = 150, message = "Quiz question cannot exceed 150 characters")
    private String question;

    /** mcq | true_false | fill_blank — defaults to mcq */
    private String quizType = "mcq";

    private String options; // JSON string of options map, e.g. {"A":"...","B":"..."}

    @NotBlank(message = "Correct answer is required")
    @Size(max = 255, message = "Correct answer cannot exceed 255 characters")
    private String correctAnswer;
}
