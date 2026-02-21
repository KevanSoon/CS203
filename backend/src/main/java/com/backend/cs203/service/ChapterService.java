package com.backend.cs203.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.backend.cs203.dto.chapter.ChapterDTO;
import com.backend.cs203.repository.ChapterRepository;

@Service
@RequiredArgsConstructor
public class ChapterService {
    private final ChapterRepository chapterRepository;

    public List<ChapterDTO> getAllChapters() {
        return chapterRepository.findAllChapters()
                .stream()
                .map(chapter -> new ChapterDTO(chapter.getId(), chapter.getTitle(), chapter.getDescription(), null, null))
                .collect(Collectors.toList());
    }
}
