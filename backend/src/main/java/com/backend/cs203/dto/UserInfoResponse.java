package com.backend.cs203.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserInfoResponse {
    private String username;
    private String email;
    private String usertype;
}
