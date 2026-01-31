package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.ChapterDTO;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.repository.ChapterRepository;

@RestController
@RequestMapping("/api/chapters")
public class ChapterController {

    private final ChapterRepository chapterRepository;

    public ChapterController(ChapterRepository chapterRepository) {
        this.chapterRepository = chapterRepository;
    }

    @GetMapping
    public ResponseEntity<List<ChapterDTO>> getAllChapters() {
        List<ChapterDTO> chapters = chapterRepository.findAll()
            .stream()
            .map(ChapterDTO::new)
            .toList();
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChapterDTO> getChapterById(@PathVariable Long id) {
        return chapterRepository.findById(id)
            .map(chapter -> ResponseEntity.ok(new ChapterDTO(chapter)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ChapterDTO> createChapter(@RequestBody ChapterDTO dto) {
        Chapter chapter = new Chapter();
        chapter.setTitle(dto.getTitle());
        chapter.setDescription(dto.getDescription());
        Chapter saved = chapterRepository.save(chapter);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ChapterDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChapterDTO> updateChapter(@PathVariable Long id, @RequestBody ChapterDTO dto) {
        return chapterRepository.findById(id)
            .map(chapter -> {
                chapter.setTitle(dto.getTitle());
                chapter.setDescription(dto.getDescription());
                Chapter updated = chapterRepository.save(chapter);
                return ResponseEntity.ok(new ChapterDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        if (chapterRepository.existsById(id)) {
            chapterRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
