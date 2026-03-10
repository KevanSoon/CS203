package com.backend.cs203.dto.lesson;

import java.util.List;

import com.backend.cs203.dto.chapter.CreateChapterRequest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreateLessonRequest {
    @NotBlank(message = "Lesson title is required")
    private String title;

    private String description;

    private String lessonPictureUrl;

    @NotEmpty(message = "A lesson must have at least one chapter")
    @Valid
    private List<CreateChapterRequest> chapters;

    private List<String> tags;
}
