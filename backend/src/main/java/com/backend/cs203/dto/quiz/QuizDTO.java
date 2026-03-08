package com.backend.cs203.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuizDTO {
    private Integer id;
    private String title;
    private String question;
    private String quizType;
    private String options;
    private String correctAnswer;

    /** Backwards-compatible constructor (defaults to mcq) */
    public QuizDTO(Integer id, String title, String question, String options, String correctAnswer) {
        this(id, title, question, "mcq", options, correctAnswer);
    }
}
