package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.CardDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Chapter;
import com.backend.cs203.entity.Lesson;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.ChapterRepository;
import com.backend.cs203.repository.LessonRepository;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardRepository cardRepository;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;

    public CardController(CardRepository cardRepository,
                            LessonRepository lessonRepository,
                            ChapterRepository chapterRepository) {
        this.cardRepository = cardRepository;
        this.lessonRepository = lessonRepository;
        this.chapterRepository = chapterRepository;
    }

    @GetMapping
    public ResponseEntity<List<CardDTO>> getAllCards() {
        List<CardDTO> cards = cardRepository.findAll()
            .stream()
            .map(CardDTO::new)
            .toList();
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getCardById(@PathVariable Long id) {
        return cardRepository.findById(id)
            .map(card -> ResponseEntity.ok(new CardDTO(card)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<CardDTO>> getCardsByLesson(@PathVariable Long lessonId) {
        List<CardDTO> cards = cardRepository.findByLessonId(lessonId)
            .stream()
            .map(CardDTO::new)
            .toList();
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<CardDTO>> getCardsByChapter(@PathVariable Long chapterId) {
        List<CardDTO> cards = cardRepository.findByChapterId(chapterId)
            .stream()
            .map(CardDTO::new)
            .toList();
        return ResponseEntity.ok(cards);
    }

    @PostMapping
    public ResponseEntity<?> createCard(@RequestBody CardDTO dto) {
        Lesson lesson = lessonRepository.findById(dto.getLessonId()).orElse(null);
        Chapter chapter = chapterRepository.findById(dto.getChapterId()).orElse(null);

        if (lesson == null) {
            return ResponseEntity.badRequest().body("Lesson not found with id: " + dto.getLessonId());
        }
        if (chapter == null) {
            return ResponseEntity.badRequest().body("Chapter not found with id: " + dto.getChapterId());
        }

        // Check if card already exists for this lesson-chapter combination
        if (cardRepository.findByLessonIdAndChapterId(dto.getLessonId(), dto.getChapterId()).isPresent()) {
            return ResponseEntity.badRequest().body("Card already exists for this lesson-chapter combination");
        }

        Card card = new Card();
        card.setLesson(lesson);
        card.setChapter(chapter);
        card.setBody(dto.getBody());
        card.setDisplayOrder(dto.getDisplayOrder());

        Card saved = cardRepository.save(card);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CardDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCard(@PathVariable Long id, @RequestBody CardDTO dto) {
        return cardRepository.findById(id)
            .map(card -> {
                card.setBody(dto.getBody());
                card.setDisplayOrder(dto.getDisplayOrder());
                Card updated = cardRepository.save(card);
                return ResponseEntity.ok(new CardDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
