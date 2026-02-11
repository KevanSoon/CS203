package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

public interface LessonSummaryDTO {
    String getTitle();
    String getDescription(); 
    String getCreatedBy();
    LocalDateTime getCreatedAt();
}