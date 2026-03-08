package com.backend.cs203.dto.chapter;

import java.util.List;

import com.backend.cs203.dto.card.CreateCardRequest;
import com.backend.cs203.dto.quiz.CreateQuizRequest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreateChapterRequest {
    @NotBlank(message = "Chapter title is required")
    private String title;

    private String description;

    @NotEmpty(message = "Each chapter must have at least one card")
    @Valid
    private List<CreateCardRequest> cards;

    @NotEmpty(message = "Each chapter must have at least one quiz question")
    @Valid
    private List<CreateQuizRequest> quizzes;
}
