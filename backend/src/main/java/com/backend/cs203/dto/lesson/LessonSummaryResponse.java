package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LessonSummaryResponse {
    private final Integer id;
    private final String title;
    private final String description;
    private final String createdBy;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final String tags;
    private final String lessonPictureUrl;
    private final LocalDateTime deletedAt;
    private final String status;
}
