package com.backend.cs203.dto.lesson;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank(message = "Lesson title is required")
    @Pattern(regexp = "^[A-Za-z0-9 ]+$", message = "Lesson title can only contain letters, numbers, and spaces")
    @Size(max = 100, message = "Lesson title cannot exceed 100 characters")
    private String title;

    @Size(max = 255, message = "Lesson description cannot exceed 255 characters")
    private String description;

    private String chapters;

    private String tags;

    private boolean draft;

    private MultipartFile lessonPictureUrl;
}
