package com.backend.cs203.repository;

import com.backend.cs203.entity.PasswordResetToken;
import com.backend.cs203.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByUserAndActiveTrue(User user);
    void deleteByUser(User user);
}