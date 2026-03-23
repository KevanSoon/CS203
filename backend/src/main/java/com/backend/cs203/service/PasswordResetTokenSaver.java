package com.backend.cs203.service;

import com.backend.cs203.entity.PasswordResetToken;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordResetTokenSaver {

    private final PasswordResetTokenRepository tokenRepository;

    @Transactional
    public void saveOtp(User user, String otp) {
        // Deactivate any existing active OTP instead of deleting
        tokenRepository.findByUserAndActiveTrue(user).ifPresent(existing -> {
            existing.setActive(false);
            tokenRepository.save(existing);
        });

        PasswordResetToken resetToken = PasswordResetToken.builder()
            .user(user)
            .otp(otp)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .attempts(0)
            .active(true)
            .build();

        tokenRepository.save(resetToken);
    }
}