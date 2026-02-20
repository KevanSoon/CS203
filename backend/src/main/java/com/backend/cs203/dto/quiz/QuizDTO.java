package com.backend.cs203.dto.quiz;

import java.time.LocalDateTime;

public interface QuizDTO {
    String getTitle();
    String getQuestion();
    String getOptions();
    String getCorrectAnswer();
    Integer getCardId();
    LocalDateTime getCreatedAt();
    
}
