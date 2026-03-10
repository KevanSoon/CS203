package com.backend.cs203.dto.progress;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Per-lesson progress detail: chapter breakdown only.
 * Lesson metadata (title, description, image) comes from
 * the existing GET /api/lesson/page endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressDTO {
    private Integer lessonId;
    private String status;              // "in_progress", "completed", or "not_started"
    private List<ChapterProgressDTO> chapters;
    private int totalItems;
    private int completedItems;
    private double progressPercent;
}
