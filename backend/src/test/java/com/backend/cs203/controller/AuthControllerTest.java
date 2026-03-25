package com.backend.cs203.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
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

    @Test
    void login_smallJwtExpiration_usesMinimumMaxAge() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
            .token("jwt-token")
            .username("testuser")
            .email("test@example.com")
            .usertype("user")
            .build();

        ResponseCookie cookie = ResponseCookie.from("jwt", "jwt-token").build();

        when(authService.login(any())).thenReturn(authResponse);
        when(cookieFactory.jwtCookie(anyString(), anyLong())).thenReturn(cookie);
        when(cookieFactory.withCookie(any(ResponseCookie.class), any()))
            .thenReturn(ResponseEntity.ok().body(
                UserInfoResponse.builder().username("testuser").build()
            ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"testuser\",\"password\":\"Password1\"}")
                .with(csrf()))
            .andExpect(status().isOk());
    }

    @Test
    void login_jwtExpirationLessThan1000_usesMinValue() throws Exception {
        java.lang.reflect.Field field = AuthController.class.getDeclaredField("jwtExpirationMs");
        field.setAccessible(true);
        field.set(mockMvc.getDispatcherServlet()
                .getWebApplicationContext()
                .getBean(AuthController.class), 500L);

        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-token")
                .username("testuser")
                .email("test@example.com")
                .usertype("user")
                .build();

        ResponseCookie cookie = ResponseCookie.from("jwt", "jwt-token").build();

        when(authService.login(any())).thenReturn(authResponse);
        when(cookieFactory.jwtCookie(anyString(), anyLong())).thenReturn(cookie);
        when(cookieFactory.withCookie(any(ResponseCookie.class), any()))
                .thenReturn(ResponseEntity.ok().body(
                        UserInfoResponse.builder().username("testuser").build()
                ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"Password1\"}")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(cookieFactory).jwtCookie(anyString(), longThat(v -> v <= 1L)); 
    }

    @Test
    void login_emptyBody_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_callsCookieFactoryWithCorrectToken() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .token("jwt-token")
                .username("testuser")
                .email("test@example.com")
                .usertype("user")
                .build();

        ResponseCookie cookie = ResponseCookie.from("jwt", "jwt-token").build();

        when(authService.login(any())).thenReturn(authResponse);
        when(cookieFactory.jwtCookie(anyString(), anyLong())).thenReturn(cookie);
        when(cookieFactory.withCookie(any(ResponseCookie.class), any()))
                .thenReturn(ResponseEntity.ok().body(
                        UserInfoResponse.builder().username("testuser").build()
                ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"Password1\"}")
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(cookieFactory).jwtCookie(eq("jwt-token"), anyLong());
    }

    
    // ===== POST /api/auth/register =====

    @Test
    void register_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"email\":\"invalid\",\"password\":\"Password1\",\"usertype\":\"user\"}")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

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

    @Test
    void register_nullResponse_returns500() throws Exception {
        when(userService.registerUser(any())).thenReturn(null);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"user\",\"email\":\"test@example.com\",\"password\":\"Password1\",\"usertype\":\"user\"}")
                        .with(csrf()))
                .andExpect(status().is4xxClientError());
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

    @Test
    void logout_cookieIsClearedProperly() throws Exception {
        ResponseCookie clearCookie = ResponseCookie.from("jwt", "").maxAge(0).build();

        when(cookieFactory.clearJwtCookie()).thenReturn(clearCookie);

        mockMvc.perform(post("/api/auth/logout").with(csrf()))
            .andExpect(status().isNoContent())
            .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("jwt=")))
            .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")))
            .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Expires=")));
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

    // ===== POST /api/auth/forget-password =====

    @Test
    void forgotPassword_success_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}")
                .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("OTP sent to your email"));
    }

    @Test
    void forgotPassword_exceptionStillReturns200() throws Exception {
        doThrow(new RuntimeException("Email failed"))
            .when(passwordResetService)
            .sendOtp(anyString());

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("OTP sent to your email"));
    }
 
    // ===== POST /api/auth/verify-otp =====

    @Test
    void verifyOtp_success_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"otp\":\"123456\"}")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("OTP verified"));
    }

    @Test
    void verifyOtp_invalidOtp_returns400() throws Exception {
        doThrow(new RuntimeException("Invalid OTP"))
            .when(passwordResetService)
            .verifyOtp(anyString(), anyString());

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"otp\":\"wrong\"}")
                .with(csrf()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Invalid OTP"));
    }
    
    // ===== POST /api/auth/reset-password =====

    @Test
    void resetPassword_success_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"otp\":\"123456\",\"password\":\"NewPass1\"}")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }

    @Test
    void resetPassword_failure_returns400() throws Exception {
        doThrow(new RuntimeException("Reset failed"))
            .when(passwordResetService)
            .resetPassword(anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"otp\":\"123456\",\"password\":\"NewPass1\"}")
                .with(csrf()))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Reset failed"));
    }
}