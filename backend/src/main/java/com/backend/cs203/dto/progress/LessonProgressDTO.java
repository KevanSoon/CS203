package com.backend.cs203.dto.progress;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressDTO {
    private Integer lessonId;
    private String title;
    private String description;
    private String lessonPictureUrl;
    private String status;              // "in_progress", "completed", or "not_started"
    private LocalDateTime lastAccessedAt;
    private LocalDateTime completedAt;
    private List<ChapterProgressDTO> chapters;
    private int totalItems;             // total cards + quizzes across all chapters
    private int completedItems;         // completed cards + quizzes across all chapters
    private double progressPercent;     // 0.0 – 100.0
}
