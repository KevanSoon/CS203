package com.backend.cs203.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;

class CookieFactoryTest {

    private CookieFactory cookieFactory;

    @BeforeEach
    void setUp() {
        cookieFactory = new CookieFactory();
        setField(cookieFactory, "jwtCookieName", "jwt");
        setField(cookieFactory, "path", "/");
        setField(cookieFactory, "sameSite", "Lax");
        setField(cookieFactory, "secureByDefault", false);
        setField(cookieFactory, "httpOnly", true);
    }

    @Test
    void jwtCookie_usesConfiguredAttributes() {
        ResponseCookie cookie = cookieFactory.jwtCookie("token-123", 1_800L);

        assertEquals("jwt", cookie.getName());
        assertEquals("token-123", cookie.getValue());
        assertEquals("/", cookie.getPath());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals(Duration.ofSeconds(1_800L), cookie.getMaxAge());
        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.isSecure());
    }

    @Test
    void clearJwtCookie_createsExpiredCookie() {
        ResponseCookie cookie = cookieFactory.clearJwtCookie();

        assertEquals("jwt", cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals(Duration.ZERO, cookie.getMaxAge());
    }

    @Test
    void jwtCookie_secureFlagEnabled_setsSecureCookie() {
        setField(cookieFactory, "secureByDefault", true);

        ResponseCookie cookie = cookieFactory.jwtCookie("token-123", 60L);

        assertTrue(cookie.isSecure());
    }

    @Test
    void withCookie_addsSetCookieHeaderAndBody() {
        ResponseCookie cookie = cookieFactory.jwtCookie("token-123", 300L);

        ResponseEntity<String> response = cookieFactory.withCookie(cookie, "ok");

        String header = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertEquals("ok", response.getBody());
        assertTrue(header != null && header.contains("jwt=token-123"));
        assertTrue(header != null && header.contains("Max-Age=300"));
        assertTrue(header != null && header.contains("Path=/"));
        assertTrue(header != null && header.contains("HttpOnly"));
        assertTrue(header != null && header.contains("SameSite=Lax"));
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
