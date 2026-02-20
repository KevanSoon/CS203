package com.backend.cs203.dto.card;

import java.time.LocalDateTime;

public interface CardDTO {
    String getFront();
    String getBack();
    String getDisplayOrder();
    Integer getChapterId();
    LocalDateTime getCreatedAt();
}
