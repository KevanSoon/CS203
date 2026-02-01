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

        // Step 1: Get the Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 2: Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token provided - continue without authentication
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Extract the token (remove "Bearer " prefix)
        String token = authHeader.substring(7);

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
