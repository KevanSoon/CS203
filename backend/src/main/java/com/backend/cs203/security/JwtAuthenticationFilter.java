package com.backend.cs203.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * JWT Authentication Filter
 * 
 * This filter runs once per request and checks for a valid JWT token.
 * If valid, it sets the user's authentication in Spring Security context.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Prefer Authorization header
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // Fallback: try reading JWT from cookie named 'jwt'
            if (request.getCookies() != null) {
                for (Cookie c : request.getCookies()) {
                    if ("jwt".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }

        // If no token found, continue unauthenticated
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 4: Validate the token
        if (!jwtUtil.validateToken(token)) {
            // Invalid token - continue without authentication
            filterChain.doFilter(request, response);
            return;
        }

        // Step 5: Extract user info from token
        String username = jwtUtil.extractUsername(token);
        String usertype = jwtUtil.extractUsertype(token);

        // Step 6: Create authentication object with user's role
        List<SimpleGrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_" + usertype.toUpperCase())
        );

        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken(username, null, authorities);

        // Step 7: Set authentication in Spring Security context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Step 8: Continue with the request
        filterChain.doFilter(request, response);
    }
}
