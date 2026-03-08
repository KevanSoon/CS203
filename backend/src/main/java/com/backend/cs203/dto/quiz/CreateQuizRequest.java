package com.backend.cs203.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateQuizRequest {
    @NotBlank(message = "Quiz title is required")
    private String title;

    @NotBlank(message = "Quiz question is required")
    private String question;

    /** mcq | true_false | fill_blank — defaults to mcq */
    private String quizType = "mcq";

    private String options; // JSON string of options map, e.g. {"A":"...","B":"..."}

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;
}
