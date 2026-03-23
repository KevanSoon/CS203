package com.backend.cs203.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.auth.AuthResponse;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.auth.UserInfoResponse;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.CookieFactory;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.AuthService;
import com.backend.cs203.service.PasswordResetService;
import com.backend.cs203.service.UserService;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private CookieFactory cookieFactory;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private PasswordResetService passwordResetService;

    // ===== POST /api/auth/login =====

    @Test
    void login_validCredentials_returns200WithCookie() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-token")
                .username("testuser")
                .email("test@example.com")
                .usertype("user")
                .build();

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .usertype("user")
                .build();

        ResponseCookie cookie = ResponseCookie.from("jwt", "jwt-token").build();

        when(authService.login(any())).thenReturn(authResponse);
        when(cookieFactory.jwtCookie(anyString(), anyLong())).thenReturn(cookie);
        when(cookieFactory.withCookie(any(ResponseCookie.class), any()))
                .thenReturn(ResponseEntity.ok()
                        .header("Set-Cookie", cookie.toString())
                        .body(userInfo));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"Password1\"}")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void login_invalidCredentials_throwsAuthException() throws Exception {
        when(authService.login(any())).thenThrow(new AuthException("Invalid username or password. Please try again"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"wrong\",\"password\":\"wrong\"}")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_missingUsername_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"Password1\"}")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    // ===== POST /api/auth/register =====

    @Test
    void register_success_returns201() throws Exception {
        RegisterResponse response = new RegisterResponse(true, "User registered successfully", null);
        when(userService.registerUser(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"newuser\",\"email\":\"new@example.com\",\"password\":\"Password1\",\"usertype\":\"user\"}")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void register_duplicateUsername_returns409() throws Exception {
        RegisterResponse response = new RegisterResponse(false, "Username already in use. Try another", null);
        when(userService.registerUser(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"existing\",\"email\":\"new@example.com\",\"password\":\"Password1\",\"usertype\":\"user\"}")
                        .with(csrf()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"\"}")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    // ===== POST /api/auth/logout =====

    @Test
    void logout_returns204WithClearedCookie() throws Exception {
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "").maxAge(0).build();
        when(cookieFactory.clearJwtCookie()).thenReturn(clearCookie);

        mockMvc.perform(post("/api/auth/logout").with(csrf()))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("Set-Cookie"));
    }

    // ===== GET /api/auth/me =====

    @Test
    void me_authenticated_returns200() throws Exception {
        UserInfoResponse userInfo = UserInfoResponse.builder()
                .username("testuser")
                .email("test@example.com")
                .usertype("user")
                .build();

        when(authService.getCurrentUser("testuser")).thenReturn(userInfo);

        mockMvc.perform(get("/api/auth/me").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void me_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
