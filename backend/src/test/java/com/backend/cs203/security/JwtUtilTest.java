package com.backend.cs203.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.cs203.entity.User;

class JwtUtilTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "this-is-a-very-long-test-secret-key-1234567890".getBytes(StandardCharsets.UTF_8));

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        setField(jwtUtil, "secretKey", SECRET);
        setField(jwtUtil, "expirationTime", 60_000L);
    }

    @Test
    void generateToken_validUser_containsExpectedClaims() {
        User user = sampleUser();

        String token = jwtUtil.generateToken(user);

        assertTrue(jwtUtil.validateToken(token));
        assertEquals("alice", jwtUtil.extractUsername(token));
        assertEquals("admin", jwtUtil.extractUsertype(token));
    }

    @Test
    void validateToken_tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken(sampleUser());
        String tampered = token.substring(0, token.length() - 2) + "ab";

        assertFalse(jwtUtil.validateToken(tampered));
    }

    @Test
    void validateToken_differentSigningKey_returnsFalse() {
        JwtUtil otherSigner = new JwtUtil();
        String otherSecret = Base64.getEncoder().encodeToString(
                "a-different-signing-secret-key-1234567890".getBytes(StandardCharsets.UTF_8));
        setField(otherSigner, "secretKey", otherSecret);
        setField(otherSigner, "expirationTime", 60_000L);

        String token = otherSigner.generateToken(sampleUser());

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    void isTokenExpired_freshToken_returnsFalse() {
        String token = jwtUtil.generateToken(sampleUser());

        assertFalse(jwtUtil.isTokenExpired(token));
    }

    private User sampleUser() {
        return User.builder()
                .username("alice")
                .email("alice@example.com")
                .usertype(User.UserType.admin)
                .build();
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException("Failed to set field: " + fieldName, e);
        }
    }
}
