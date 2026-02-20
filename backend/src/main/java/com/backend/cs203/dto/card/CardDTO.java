package com.backend.cs203.dto.card;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CardDTO {
    private Integer id;
    private String front;
    private String back;
    private Integer displayOrder;
}
