package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.entity.PasswordResetToken;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.PasswordResetTokenRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.impl.PasswordResetServiceImpl;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.Emails;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private PasswordResetTokenSaver tokenSaver;
    @Mock private Resend resend;
    @Mock private Emails emails;

    @InjectMocks
    private PasswordResetServiceImpl passwordResetService;

    private User activeUser;

    @BeforeEach
    void setUp() throws ResendException {
        activeUser = User.builder()
                .id(1)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Returns an active, unexpired token for the given user and OTP. */
    private PasswordResetToken activeToken(User user, String otp, int attempts) {
        return PasswordResetToken.builder()
                .user(user)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .attempts(attempts)
                .active(true)
                .build();
    }

    /** Returns an expired token. */
    private PasswordResetToken expiredToken(User user, String otp) {
        return PasswordResetToken.builder()
                .user(user)
                .otp(otp)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .attempts(0)
                .active(true)
                .build();
    }

    // Helper to call in tests that reach sendOtpEmail
    private void stubResendSuccess() throws ResendException {
        when(resend.emails()).thenReturn(emails);
        when(emails.send(any(CreateEmailOptions.class)))
                .thenReturn(new CreateEmailResponse());
    }

    // =========================================================================
    // sendOtp
    // =========================================================================

    @Test
    void sendOtp_validEmail_savesOtpAndSendsEmail() throws ResendException {
        stubResendSuccess();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));

        passwordResetService.sendOtp("test@example.com");

        verify(tokenSaver).saveOtp(eq(activeUser), anyString());
        verify(emails).send(any(CreateEmailOptions.class));
    }

    @Test
    void sendOtp_generatedOtpIsSixDigits() throws ResendException {
        stubResendSuccess();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        passwordResetService.sendOtp("test@example.com");

        verify(tokenSaver).saveOtp(eq(activeUser), otpCaptor.capture());
        String otp = otpCaptor.getValue();
        assertEquals(6, otp.length());
        assertTrue(otp.matches("\\d{6}"), "OTP should be exactly 6 numeric digits");
    }

    @Test
    void sendOtp_emailNotFound_throwsNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.sendOtp("unknown@example.com"));
        assertEquals(404, ex.getStatusCode().value());

        verify(tokenSaver, never()).saveOtp(any(), any());
    }

    @Test
    void sendOtp_deactivatedUser_throwsForbidden() {
        activeUser.setDeactivatedAt(java.time.Instant.now());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.sendOtp("test@example.com"));
        assertEquals(403, ex.getStatusCode().value());

        verify(tokenSaver, never()).saveOtp(any(), any());
    }

    @Test
    void sendOtp_resendFails_throwsBadGateway() throws ResendException {
        when(resend.emails()).thenReturn(emails);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(emails.send(any(CreateEmailOptions.class))).thenThrow(new RuntimeException("Resend down"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.sendOtp("test@example.com"));
        assertEquals(422, ex.getStatusCode().value());
    }

    // =========================================================================
    // verifyOtp
    // =========================================================================

    @Test
    void verifyOtp_correctOtp_doesNotThrow() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser))
                .thenReturn(Optional.of(activeToken(activeUser, "123456", 0)));

        assertDoesNotThrow(() -> passwordResetService.verifyOtp("test@example.com", "123456"));
    }

    @Test
    void verifyOtp_emailNotFound_throwsNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("unknown@example.com", "123456"));
        assertEquals(404, ex.getStatusCode().value());
    }

    @Test
    void verifyOtp_noActiveToken_throwsBadRequest() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "123456"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void verifyOtp_expiredToken_deactivatesTokenAndThrowsBadRequest() {
        PasswordResetToken token = expiredToken(activeUser, "123456");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "123456"));

        assertEquals(400, ex.getStatusCode().value());
        assertFalse(token.isActive(), "Expired token should be deactivated");
        verify(tokenRepository).save(token);
    }

    @Test
    void verifyOtp_wrongOtp_incrementsAttempts() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "000000"));

        assertEquals(1, token.getAttempts());
        verify(tokenRepository).save(token);
    }

    @Test
    void verifyOtp_wrongOtp_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "000000"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void verifyOtp_fifthWrongAttempt_deactivatesTokenAndThrowsBadRequest() {
        // 4 prior attempts — the 5th wrong attempt should lock it
        PasswordResetToken token = activeToken(activeUser, "123456", 4);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "000000"));

        assertEquals(400, ex.getStatusCode().value());
        assertFalse(token.isActive(), "Token should be deactivated after 5 wrong attempts");
        assertEquals(5, token.getAttempts());
        verify(tokenRepository).save(token);
    }

    @Test
    void verifyOtp_fourthWrongAttempt_doesNotDeactivateToken() {
        // 3 prior attempts — 4th wrong attempt should NOT lock yet
        PasswordResetToken token = activeToken(activeUser, "123456", 3);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        assertThrows(ResponseStatusException.class,
                () -> passwordResetService.verifyOtp("test@example.com", "000000"));

        assertTrue(token.isActive(), "Token should still be active after only 4 wrong attempts");
    }

    // =========================================================================
    // resetPassword
    // =========================================================================

    @Test
    void resetPassword_validInputs_encodesAndSavesPassword() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser))
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewPassword1")).thenReturn("encodedNew");

        passwordResetService.resetPassword("test@example.com", "123456", "NewPassword1");

        assertEquals("encodedNew", activeUser.getPassword());
        verify(userRepository).save(activeUser);
    }

    @Test
    void resetPassword_validInputs_deactivatesOtpAfterReset() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser))
                // called once by verifyOtp, once by the deactivation block
                .thenReturn(Optional.of(token));
        when(passwordEncoder.encode(any())).thenReturn("encodedNew");

        passwordResetService.resetPassword("test@example.com", "123456", "NewPassword1");

        assertFalse(token.isActive(), "OTP token should be soft-deleted after successful reset");
        verify(tokenRepository, atLeastOnce()).save(token);
    }

    @Test
    void resetPassword_wrongOtp_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "000000", "NewPassword1"));
        assertEquals(400, ex.getStatusCode().value());

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_expiredOtp_throwsBadRequest() {
        PasswordResetToken token = expiredToken(activeUser, "123456");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", "NewPassword1"));
        assertEquals(400, ex.getStatusCode().value());

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_blankPassword_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", ""));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_passwordTooShort_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", "Ab1"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_passwordTooLong_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        String longPassword = "Aa1" + "a".repeat(99);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", longPassword));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_passwordMissingUppercase_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", "lowercase1"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_passwordMissingLowercase_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", "UPPERCASE1"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_passwordMissingDigit_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", "NoDigitsHere"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void resetPassword_nullPassword_throwsBadRequest() {
        PasswordResetToken token = activeToken(activeUser, "123456", 0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(activeUser));
        when(tokenRepository.findByUserAndActiveTrue(activeUser)).thenReturn(Optional.of(token));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> passwordResetService.resetPassword("test@example.com", "123456", null));
        assertEquals(400, ex.getStatusCode().value());
    }
}