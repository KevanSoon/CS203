package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.cs203.dto.QuizDTO;
import com.backend.cs203.entity.Card;
import com.backend.cs203.entity.Quiz;
import com.backend.cs203.repository.CardRepository;
import com.backend.cs203.repository.QuizRepository;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizRepository quizRepository;
    private final CardRepository cardRepository;

    public QuizController(QuizRepository quizRepository, CardRepository cardRepository) {
        this.quizRepository = quizRepository;
        this.cardRepository = cardRepository;
    }

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllQuizzes() {
        List<QuizDTO> quizzes = quizRepository.findAll()
            .stream()
            .map(QuizDTO::new)
            .toList();
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
            .map(quiz -> ResponseEntity.ok(new QuizDTO(quiz)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/card/{cardId}")
    public ResponseEntity<QuizDTO> getQuizByCard(@PathVariable Long cardId) {
        return quizRepository.findByCardId(cardId)
            .map(quiz -> ResponseEntity.ok(new QuizDTO(quiz)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody QuizDTO dto) {
        Card card = cardRepository.findById(dto.getCardId()).orElse(null);

        if (card == null) {
            return ResponseEntity.badRequest().body("Card not found with id: " + dto.getCardId());
        }

        // Check if quiz already exists for this card
        if (quizRepository.findByCardId(dto.getCardId()).isPresent()) {
            return ResponseEntity.badRequest().body("Quiz already exists for this card");
        }

        Quiz quiz = new Quiz();
        quiz.setCard(card);
        quiz.setTitle(dto.getTitle());
        quiz.setQuestion(dto.getQuestion());
        quiz.setOptions(dto.getOptions());
        quiz.setCorrectAnswer(dto.getCorrectAnswer());

        Quiz saved = quizRepository.save(quiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(new QuizDTO(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @RequestBody QuizDTO dto) {
        return quizRepository.findById(id)
            .map(quiz -> {
                quiz.setTitle(dto.getTitle());
                quiz.setQuestion(dto.getQuestion());
                quiz.setOptions(dto.getOptions());
                quiz.setCorrectAnswer(dto.getCorrectAnswer());
                Quiz updated = quizRepository.save(quiz);
                return ResponseEntity.ok(new QuizDTO(updated));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        if (quizRepository.existsById(id)) {
            quizRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
