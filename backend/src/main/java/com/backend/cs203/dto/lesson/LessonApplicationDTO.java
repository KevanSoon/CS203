package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;

public interface LessonApplicationDTO extends LessonSummaryDTO{
    String getStatus();
    LocalDateTime getDeletedAt();
}
