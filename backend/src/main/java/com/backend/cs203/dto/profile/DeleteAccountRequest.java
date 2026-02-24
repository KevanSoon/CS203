package com.backend.cs203.dto.profile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeleteAccountRequest {
    private String username;
    private String password;
}