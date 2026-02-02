package com.backend.cs203.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

/**
 * Centralized factory for building and clearing JWT cookies.
 * Cookie attributes are configurable via application.properties.
 */
@Component
public class CookieFactory {

    @Value("${cookie.jwt.name:jwt}")
    private String jwtCookieName;

    @Value("${cookie.path:/}")
    private String path;

    @Value("${cookie.sameSite:Lax}")
    private String sameSite;

    @Value("${cookie.secure:false}")
    private boolean secureByDefault;

    @Value("${cookie.httpOnly:true}")
    private boolean httpOnly;

    private ResponseCookie build(String value, long maxAgeSeconds, boolean secure) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(jwtCookieName, value)
                .path(path)
                .maxAge(maxAgeSeconds)
                .sameSite(sameSite);

        if (httpOnly) b.httpOnly(true);
        if (secure) b.secure(true);

        return b.build();
    }

    public ResponseCookie jwtCookie(String token, long maxAgeSeconds) {
        return build(token, maxAgeSeconds, secureByDefault);
    }

    public ResponseCookie clearJwtCookie() {
        return build("", 0, secureByDefault);
    }

    public <T> ResponseEntity<T> withCookie(ResponseCookie cookie, T body) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(body);
    }
}
