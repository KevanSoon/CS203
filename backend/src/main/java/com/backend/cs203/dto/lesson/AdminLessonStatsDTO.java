package com.backend.cs203.dto.lesson;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminLessonStatsDTO {
    private long totalLessons;
    private long publishedLessons;
    private long totalAttempts;
    private long totalCompletions;
}
