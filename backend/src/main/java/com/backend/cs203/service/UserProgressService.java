package com.backend.cs203.service;

import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.progress.DashboardResponseDTO;
import com.backend.cs203.dto.progress.LessonProgressDTO;

public interface UserProgressService {

    /**
     * Lightweight dashboard: returns progress-only data for every approved
     * lesson. Uses batch queries — O(1) queries regardless of lesson/chapter
     * count.
     */
    @Transactional
    public DashboardResponseDTO getDashboard(String username);

    /**
     * Detailed chapter-by-chapter progress for a single lesson. Uses batch
     * queries — O(1) queries regardless of chapter count.
     */
    @Transactional(readOnly = true)
    public LessonProgressDTO getLessonProgress(String username, Integer lessonId);

    /**
     * Mark a card as completed for a user. INSERT is the critical write —
     * lesson progress housekeeping runs after.
     */
    @Transactional
    public void markCardComplete(String username, Integer cardId);

    /**
     * Called by the controller after a quiz result is saved.
     * Resolves the chapter → lesson, then checks whether every
     * chapter (cards + quiz) is now fully completed.
     */
    @Transactional
    public void checkLessonCompletionForChapter(String username, Integer chapterId);

    @Transactional
    public void resetLessonProgress(Integer userId, Integer lessonId);
}
