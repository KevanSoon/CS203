package com.backend.cs203.dto.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCardRequest {
    @NotBlank(message = "Card front content is required")
    @Size(max = 150, message = "Card front cannot exceed 150 characters")
    private String front;

    @NotBlank(message = "Card back content is required")
    @Size(max = 150, message = "Card back cannot exceed 150 characters")
    private String back;

    @NotNull(message = "Display order is required")
    private Integer displayOrder;
}
