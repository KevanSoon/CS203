package com.backend.cs203.service;

import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.LoginRequest;
import com.backend.cs203.dto.auth.UserInfoResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserInfoResponse getCurrentUser(String username);
    
}