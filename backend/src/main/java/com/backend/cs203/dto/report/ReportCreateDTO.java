package com.backend.cs203.dto.report;

import lombok.Data;

@Data
public class ReportCreateDTO {

    private String title;
    private String description;
    private String type;
    private Integer lessonId;
    private Integer chapterId;

}