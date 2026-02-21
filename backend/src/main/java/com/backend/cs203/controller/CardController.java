package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.card.CardDTO;
import com.backend.cs203.service.CardService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/card")
public class CardController {
    
    private final CardService cardService;

    @GetMapping("/")
    public ResponseEntity<List<CardDTO>> getAllAvailableCards() {
            return ResponseEntity.ok(cardService.getAllCards());
}

}
