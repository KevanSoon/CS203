package com.backend.cs203.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.dto.error.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;

 
@Configuration              
@EnableWebSecurity          // Enables Spring Security for the application
@EnableMethodSecurity       // Allows @PreAuthorize, @Secured annotations on methods
@RequiredArgsConstructor    // Lombok: auto-generates constructor for final fields
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /*
     * Main security configuration
     * Defines endpoint access rules and JWT filter setup
     * Defines which endpoints are public vs protected
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless JWT auth)
            .csrf(csrf -> csrf.disable())
            
            // Enable CORS, custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Configure endpoint authorization
            .authorizeHttpRequests(auth -> auth
                // Root page - public access
                .requestMatchers("/", "/index.html").permitAll()

                // Public endpoints - no authentication required
                // Allow login and register publicly, keep other /api/auth endpoints protected
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                .requestMatchers("/api/health").permitAll()         // Health check
                .requestMatchers("/api/hello").permitAll()          // Test endpoint
                .requestMatchers("/api/db/test").permitAll()        // DB test
                .requestMatchers("/api/test/**").permitAll()        // Storage test
    
                // Swagger/OpenAPI documentation - allow GET requests for UI and docs
                .requestMatchers(HttpMethod.GET,
                    "/api/docs",
                    "/api/docs/**",
                    "/api/docs/openapi",
                    "/api/swagger-ui/**",
                    "/api/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()

                // Admin-only endpoints -- for future implementation for LA,WA
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // All other requests must be authenticated
                .anyRequest().authenticated()
            )

            // Stateless session (required for JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Custom exception handling for auth errors
            .exceptionHandling(ex -> ex
                // Handle 401 Unauthorized (not authenticated)
                .authenticationEntryPoint((request, response, authException) -> 
                    writeErrorResponse(response, request, HttpStatus.UNAUTHORIZED, "Authentication required"))
                // Handle 403 Forbidden (authenticated but insufficient permissions)
                .accessDeniedHandler((request, response, accessDeniedException) -> 
                    writeErrorResponse(response, request, HttpStatus.FORBIDDEN, "Access denied: insufficient permissions"))
            )
            
            // Add JWT filter before Spring Security's default authentication filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Password encoder bean
     * Uses BCrypt hashing algorithm for secure password storage
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration
     * Allows frontend (Next.js) to call backend API from different port
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from these origins (frontend URLs)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:7860"));
        
        // Allow these HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow cookies/credentials to be sent
        configuration.setAllowCredentials(true);

        // Apply this configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Helper method to create standardized error responses
     */
    private void writeErrorResponse(HttpServletResponse response, HttpServletRequest request, 
                                   HttpStatus status, String message) {
        try {
            ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(Instant.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();
            
            response.setStatus(status.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            
            ObjectMapper mapper = new ObjectMapper();
            // have to serialise using jackson, convert Instant/LocalDateTime object into json
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            response.getWriter().write(mapper.writeValueAsString(errorResponse));
        } catch (IOException e) {
            // Fallback if JSON writing fails
            response.setStatus(status.value());
        }
    }
}
