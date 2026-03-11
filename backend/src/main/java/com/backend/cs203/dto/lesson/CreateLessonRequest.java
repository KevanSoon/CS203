package com.backend.cs203.dto.lesson;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank(message = "Lesson title is required")
    private String title;

    private String description;

    @NotEmpty(message = "A lesson must have at least one chapter")
    @Valid
    private String chapters;

    private String tags;

    private MultipartFile lessonPictureUrl;
}
