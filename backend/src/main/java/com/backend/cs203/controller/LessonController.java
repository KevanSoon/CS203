package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.LessonDTO;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.repository.LessonRepository;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonRepository lessonRepository;

    public LessonController(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @GetMapping
    public ResponseEntity<List<LessonDTO>> getAllLessons() {
        List<LessonDTO> lessons = lessonRepository.findAll()
            .stream()
            .map(LessonDTO::new)
            .toList();
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable Long id) {
        return lessonRepository.findById(id)
            .map(lesson -> ResponseEntity.ok(new LessonDTO(lesson)))
            .orElse(ResponseEntity.notFound().build());
    }

    // Returns full nested response: lesson -> chapters -> contents + quiz
    @GetMapping("/{id}/full")
    public ResponseEntity<LessonDTO> getLessonWithChapters(@PathVariable Long id) {
        return lessonRepository.findById(id)
            .map(lesson -> ResponseEntity.ok(new LessonDTO(lesson, true)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LessonDTO> createLesson(@RequestBody LessonDTO dto) {
        Lesson lesson = new Lesson();
        lesson.setTitle(dto.getTitle());
        lesson.setDescription(dto.getDescription());
        Lesson saved = lessonRepository.save(lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(new LessonDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable Long id, @RequestBody LessonDTO dto) {
        return lessonRepository.findById(id)
            .map(lesson -> {
                lesson.setTitle(dto.getTitle());
                lesson.setDescription(dto.getDescription());
                Lesson updated = lessonRepository.save(lesson);
                return ResponseEntity.ok(new LessonDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        if (lessonRepository.existsById(id)) {
            lessonRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
