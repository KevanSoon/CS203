package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LessonSummaryResponse {
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private String tags;
    private String lessonPictureUrl;
}
