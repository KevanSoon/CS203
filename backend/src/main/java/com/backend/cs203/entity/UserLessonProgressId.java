package com.backend.cs203.entity;

import java.io.Serializable;
import java.util.Objects;

public class UserLessonProgressId implements Serializable {

    private Integer userId;
    private Integer lessonId;

    public UserLessonProgressId() {}

    public UserLessonProgressId(Integer userId, Integer lessonId) {
        this.userId = userId;
        this.lessonId = lessonId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserLessonProgressId that)) return false;
        return Objects.equals(userId, that.userId)
            && Objects.equals(lessonId, that.lessonId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, lessonId);
    }
}
