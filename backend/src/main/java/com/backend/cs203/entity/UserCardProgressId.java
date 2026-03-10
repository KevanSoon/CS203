package com.backend.cs203.entity;

import java.io.Serializable;
import java.util.Objects;

public class UserCardProgressId implements Serializable {

    private Integer userId;
    private Integer cardId;

    public UserCardProgressId() {}

    public UserCardProgressId(Integer userId, Integer cardId) {
        this.userId = userId;
        this.cardId = cardId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserCardProgressId that)) return false;
        return Objects.equals(userId, that.userId)
            && Objects.equals(cardId, that.cardId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, cardId);
    }
}
