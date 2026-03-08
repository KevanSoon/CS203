package com.backend.cs203.dto.lesson;

import java.time.LocalDateTime;
import java.util.List;

import com.backend.cs203.dto.chapter.ChapterDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LessonPageDTO {
    private Integer id;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<ChapterDTO> chapters;
    private List<String> tags;

    /** Backwards-compatible constructor (no tags). */
    public LessonPageDTO(Integer id, String title, String description, String createdBy,
                         LocalDateTime createdAt, List<ChapterDTO> chapters) {
        this(id, title, description, createdBy, createdAt, chapters, null);
    }
}
