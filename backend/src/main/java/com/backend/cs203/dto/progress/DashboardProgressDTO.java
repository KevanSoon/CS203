package com.backend.cs203.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight progress-only DTO for the dashboard.
 * Lesson metadata (title, description, image, tags) comes from
 * the existing LessonController GET /api/lesson/ endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardProgressDTO {
    private Integer lessonId;
    private String status;           // "in_progress", "completed", or "not_started"
    private int totalItems;
    private int completedItems;
    private double progressPercent;  // 0.0 – 100.0
}
