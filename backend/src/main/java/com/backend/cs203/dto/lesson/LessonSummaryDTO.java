package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

public interface LessonSummaryDTO {
    Integer getId();
    String getTitle();
    String getDescription();
    String getCreatedBy();
    String getStatus();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
    String getTags();
    String getLessonPictureUrl();
    LocalDateTime getDeletedAt();
}