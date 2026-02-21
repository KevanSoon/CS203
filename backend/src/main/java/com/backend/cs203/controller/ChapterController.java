package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.service.ChapterService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chapter")
public class ChapterController {
    
    private final ChapterService chapterService;

    @GetMapping("/")
    public ResponseEntity<List<ChapterDTO>> getAllAvailableChapters() {
            return ResponseEntity.ok(chapterService.getAllChapters());
    }
}
