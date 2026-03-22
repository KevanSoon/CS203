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
    private final PasswordResetTokenSaver tokenSaver;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No account with that email"));

        if (user.getDeactivatedAt() != null) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "This account has been deactivated");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        tokenSaver.saveOtp(user, otp);

        sendOtpEmail(email, otp);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        PasswordResetToken resetToken = tokenRepository.findByUserAndActiveTrue(user)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "No OTP requested for this email"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            resetToken.setActive(false);
            tokenRepository.save(resetToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }

        if (!resetToken.getOtp().equals(otp)) {
            resetToken.setAttempts(resetToken.getAttempts() + 1);
            if (resetToken.getAttempts() >= 5) {
                resetToken.setActive(false);
                tokenRepository.save(resetToken);
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

        // Deactivate OTP instead of deleting
        tokenRepository.findByUserAndActiveTrue(user).ifPresent(token -> {
            token.setActive(false);
            tokenRepository.save(token);
        });
    }

    private void sendOtpEmail(String email, String otp) {
        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("Your Simi Slang reset code 🔑")
                .text(
                    "Eh, forgot your password ah?\n\n" +
                    "No worries lah, here's your one-time code:\n\n" +
                    "👉 " + otp + "\n\n" +
                    "This code expires in 10 minutes hor. Don't screenshot and send to your friend ah, keep it to yourself only.\n\n" +
                    "If you never request this, just ignore lah. Your account still safe one.\n\n" +
                    "— Simi Slang"
                )
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

        boolean hasLower = false;
        boolean hasUpper = false;
        boolean hasDigit = false;

        for (char c : password.toCharArray()) {
            if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isDigit(c)) hasDigit = true;

            if (hasLower && hasUpper && hasDigit) break; // exit early once all found
        }

        if (!hasLower) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one lowercase letter");
        }
        if (!hasUpper) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one uppercase letter");
        }
        if (!hasDigit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one number");
        }
    }
}