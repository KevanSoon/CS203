package com.backend.cs203.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.entity.PasswordResetToken;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.PasswordResetTokenRepository;
import com.backend.cs203.repository.UserRepository;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    @Transactional
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No account with that email"));

        if (user.getDeactivatedAt() != null) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "This account has been deactivated");
        }

        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        String otp = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .user(user)
            .otp(otp)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .attempts(0)
            .build();

        tokenRepository.save(resetToken);

        sendOtpEmail(email, otp);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        PasswordResetToken resetToken = tokenRepository.findByUser(user)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "No OTP requested for this email"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }

        if (!resetToken.getOtp().equals(otp)) {
            resetToken.setAttempts(resetToken.getAttempts() + 1);
            if (resetToken.getAttempts() >= 5) {
                tokenRepository.delete(resetToken);
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Too many attempts. Request a new OTP.");
            }
            tokenRepository.save(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect OTP");
        }
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);

        validatePassword(newPassword);

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.deleteByUser(user);
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("Your password reset code")
                .text("Your OTP is: " + otp + "\n\nThis code expires in 10 minutes. Do not share it with anyone.")
                .build();
            resend.emails().send(params);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send OTP email");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password too short (min 8)");
        }
        if (password.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password too long (max 100)");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one lowercase letter");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one uppercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one number");
        }
    }
}