package com.backend.cs203.dto;

import java.time.LocalDateTime;

import com.backend.cs203.entity.Card;

public class CardDTO {
    private Long id;
    private Long lessonId;   // Used for creating card
    private Long chapterId;  // Used for creating card
    private String body;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CardDTO() {}

    public CardDTO(Card card) {
        this.id = card.getId();
        this.body = card.getBody();
        this.displayOrder = card.getDisplayOrder();
        this.createdAt = card.getCreatedAt();
        this.updatedAt = card.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public Long getChapterId() { return chapterId; }
    public void setChapterId(Long chapterId) { this.chapterId = chapterId; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
