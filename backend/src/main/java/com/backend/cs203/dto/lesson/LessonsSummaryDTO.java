package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

public interface LessonsSummaryDTO {
    String getTitle();
    String getDescription(); 
    LocalDateTime getCreatedAt();
}