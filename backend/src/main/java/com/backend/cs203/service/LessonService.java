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
    
    public List<LessonsSummaryDTO> getAllLessonSummaries() {
        return lessonRepository.findAllLessons();
    }
}
