package com.backend.cs203.dto.lesson;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank(message = "Lesson title is required")
    @Pattern(regexp = "^[A-Za-z0-9 ]+$", message = "Lesson title can only contain letters, numbers, and spaces")
    private String title;

    private String description;

    private String chapters;

    private String tags;

    private boolean draft;

    private MultipartFile lessonPictureUrl;
}
