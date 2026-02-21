package com.backend.cs203.dto.chapter;

import java.util.List;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.dto.quiz.QuizDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChapterDTO {
    private Integer id;
    private String title;
    private String description;
    private List<CardDTO> cards;
    private List<QuizDTO> quizQuestions;
}
