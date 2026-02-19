package com.backend.cs203.dto.chapter;

import java.time.LocalDateTime;

public interface ChapterDTO {
    String getTitle();
    String getDescription();
    LocalDateTime getCreatedAt();
    Integer getLessonId();

    
}
