package com.backend.cs203.service;

import org.springframework.scheduling.annotation.Async;

import com.backend.cs203.dto.lesson.LessonPageDTO;

public interface VectorStoreService {

    @Async
    public void insertLesson(LessonPageDTO lesson);

    @Async
    public void deleteLesson(Integer lessonId);

}
