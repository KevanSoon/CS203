package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.entity.PasswordResetToken;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.PasswordResetTokenRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetTokenSaverTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @InjectMocks
    private PasswordResetTokenSaver passwordResetTokenSaver;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .build();
    }

    @Test
    void saveOtp_noExistingActiveToken_savesNewToken() {
        when(tokenRepository.findByUserAndActiveTrue(testUser)).thenReturn(Optional.empty());

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);

        passwordResetTokenSaver.saveOtp(testUser, "123456");

        verify(tokenRepository, times(1)).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertEquals(testUser, savedToken.getUser());
        assertEquals("123456", savedToken.getOtp());
        assertTrue(savedToken.isActive());
        assertEquals(0, savedToken.getAttempts());
        assertTrue(savedToken.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void saveOtp_existingActiveToken_deactivatesExistingAndSavesNewToken() {
        PasswordResetToken existingToken = PasswordResetToken.builder()
                .user(testUser)
                .otp("oldOtp")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(0)
                .active(true)
                .build();

        when(tokenRepository.findByUserAndActiveTrue(testUser)).thenReturn(Optional.of(existingToken));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);

        passwordResetTokenSaver.saveOtp(testUser, "newOtp");

        // Verify that the existing token was deactivated and saved
        verify(tokenRepository, times(2)).save(tokenCaptor.capture());
        PasswordResetToken deactivatedToken = tokenCaptor.getAllValues().get(0);
        PasswordResetToken newToken = tokenCaptor.getAllValues().get(1);

        assertEquals(existingToken, deactivatedToken);
        assertEquals(false, deactivatedToken.isActive());

        // Verify that a new token was saved
        assertEquals(testUser, newToken.getUser());
        assertEquals("newOtp", newToken.getOtp());
        assertTrue(newToken.isActive());
        assertEquals(0, newToken.getAttempts());
        assertTrue(newToken.getExpiresAt().isAfter(LocalDateTime.now()));
    }
}
