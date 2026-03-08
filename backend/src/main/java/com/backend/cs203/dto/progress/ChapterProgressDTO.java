package com.backend.cs203.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChapterProgressDTO {
    private Integer chapterId;
    private String title;
    private int totalCards;
    private int completedCards;
    private boolean hasQuiz;
    private boolean quizCompleted;
    private int totalItems;          // totalCards + (hasQuiz ? 1 : 0)
    private int completedItems;      // completedCards + (quizCompleted ? 1 : 0)
    private double progressPercent;  // 0.0 – 100.0
}
