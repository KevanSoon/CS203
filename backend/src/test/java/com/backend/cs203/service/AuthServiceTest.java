package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.LoginRequest;
import com.backend.cs203.dto.auth.UserInfoResponse;
import com.backend.cs203.entity.User;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.SupabaseStorageService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SupabaseStorageService supabaseStorageService;

    @InjectMocks
    private AuthService authService;

    // ===== login =====

    @Test
    void login_validCredentials_returnsAuthResponse() {
        User user = User.builder()
                .id(1)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .usertype(User.UserType.user)
                .build();

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("rawPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse result = authService.login(request);

        assertEquals("jwt-token", result.getToken());
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("user", result.getUsertype());
        assertNotNull(user.getLastLogin());
        verify(userRepository).save(user);
    }

    @Test
    void login_userNotFound_throwsAuthException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals("Invalid username or password. Please try again", ex.getMessage());
    }

    @Test
    void login_deactivatedAccount_throwsAuthException() {
        User user = User.builder()
                .id(1)
                .username("testuser")
                .password("encodedPassword")
                .deactivatedAt(Instant.now())
                .build();

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        AuthException ex = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals("Account has been deactivated. Please contact the support team", ex.getMessage());
    }

    @Test
    void login_wrongPassword_throwsAuthException() {
        User user = User.builder()
                .id(1)
                .username("testuser")
                .password("encodedPassword")
                .build();

        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        AuthException ex = assertThrows(AuthException.class, () -> authService.login(request));
        assertEquals("Invalid username or password. Please try again", ex.getMessage());
    }

    // ===== getCurrentUser =====

    @Test
    void getCurrentUser_existingUser_returnsUserInfo() {
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .usertype(User.UserType.admin)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserInfoResponse result = authService.getCurrentUser("testuser");

        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("admin", result.getUsertype());
    }

    @Test
    void getCurrentUser_userNotFound_throwsAuthException() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class,
                () -> authService.getCurrentUser("nonexistent"));
        assertEquals("User not found. Refresh and try again", ex.getMessage());
    }
}
