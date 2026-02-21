package com.backend.cs203.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.dto.lesson.LessonApplicationDTO;
import com.backend.cs203.dto.lesson.LessonPageDTO;
import com.backend.cs203.dto.lesson.LessonSummaryDTO;
import com.backend.cs203.dto.quiz.QuizDTO;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;
import com.backend.cs203.repository.QuizRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final CardRepository cardRepository;
    private final QuizRepository quizRepository;

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

    public LessonPageDTO getLessonPage(String lessonTitle) {
        //find lesson by title, if not throw exception
        Lesson lesson = lessonRepository.findByTitle(lessonTitle)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        //find chapters that matches lesson id
        List<Chapter> chapters = chapterRepository.findByLessonId(lesson.getId());

        //loop through each chapter
        List<ChapterDTO> chapterDetails = chapters.stream().map(chapter -> {
            //find cards for this chapter and map to CardDTO
            List<CardDTO> cards = cardRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(card -> new CardDTO(card.getId(), card.getFront(), card.getBack(), card.getDisplayOrder()))
                    .collect(Collectors.toList());
            //find quiz questions for this chapter and map to QuizDTO
            List<QuizDTO> quizzes = quizRepository.findByChapterId(chapter.getId())
                    .stream()
                    .map(quiz -> new QuizDTO(quiz.getId(), quiz.getTitle(), quiz.getQuestion(), quiz.getOptions(), quiz.getCorrectAnswer()))
                    .collect(Collectors.toList());
            
            //build ChapterDTO that requires CardDTO and QuizDTO
            return new ChapterDTO(chapter.getId(), chapter.getTitle(), chapter.getDescription(), cards, quizzes);
        }).collect(Collectors.toList());

        //build LessonPageDTO
        return new LessonPageDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getCreatedBy().getUsername(),
                lesson.getCreatedAt(),
                chapterDetails
        );
    }
}
