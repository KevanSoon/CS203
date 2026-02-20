package com.backend.cs203.service;

import java.util.List;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.backend.cs203.dto.lesson.*;
import com.backend.cs203.repository.LessonRepository;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    
    public List<LessonSummaryDTO> getAllLessons() {
        return lessonRepository.findAllLessons();
    }
    public List<LessonSummaryDTO> getUserCreatedLessons(int id) {
        return lessonRepository.findUserCreatedLessons(id);
    }
    public List<LessonApplicationDTO> getAllLessonApplications() {
        return lessonRepository.findAllLessonApplications();
    }
    public List<LessonSummaryDTO> getPendingLessonApplications() {
        return lessonRepository.findAllPendingLessonApplications();
    }

}