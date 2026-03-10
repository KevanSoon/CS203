package com.backend.cs203.dto.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCardRequest {
    @NotBlank(message = "Card front content is required")
    private String front;

    @NotBlank(message = "Card back content is required")
    private String back;

    @NotNull(message = "Display order is required")
    private Integer displayOrder;
}
