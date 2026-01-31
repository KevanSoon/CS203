package com.backend.cs203.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;

public class ChapterDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CardDTO> cards = new ArrayList<>();
    private QuizDTO quiz;

    public ChapterDTO() {}

    // Simple DTO without nested cards
    public ChapterDTO(Chapter chapter) {
        this.id = chapter.getId();
        this.title = chapter.getTitle();
        this.description = chapter.getDescription();
        this.createdAt = chapter.getCreatedAt();
        this.updatedAt = chapter.getUpdatedAt();
    }

    // Constructor with cards for a specific lesson-chapter relationship
    public ChapterDTO(Chapter chapter, List<Card> chapterCards) {
        this(chapter);
        if (chapterCards != null && !chapterCards.isEmpty()) {
            this.cards = chapterCards.stream()
                .map(CardDTO::new)
                .collect(Collectors.toList());

            // Get quiz from the first card that has one (per schema: 1 quiz per chapter)
            chapterCards.stream()
                .filter(c -> c.getQuiz() != null)
                .findFirst()
                .ifPresent(c -> this.quiz = new QuizDTO(c.getQuiz()));
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<CardDTO> getCards() { return cards; }
    public void setCards(List<CardDTO> cards) { this.cards = cards; }
    public QuizDTO getQuiz() { return quiz; }
    public void setQuiz(QuizDTO quiz) { this.quiz = quiz; }
}
