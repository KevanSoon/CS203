package com.backend.cs203.controller;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.UserService;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ===== GET /api/profile =====

    @Test
    void getProfile_authenticated_returns200() throws Exception {
        UserResponse response = new UserResponse("testuser", "test@example.com", null);
        when(userService.getMyProfile()).thenReturn(response);

        mockMvc.perform(get("/api/profile").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void getProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getProfile_serviceThrowsException_returns500() throws Exception {
        when(userService.getMyProfile())
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        mockMvc.perform(get("/api/profile").with(user("testuser").roles("USER")))
                .andExpect(status().isInternalServerError());
    }

    // ===== PATCH /api/profile =====

    @Test
    void updateProfile_authenticated_returns200() throws Exception {
        UserResponse response = new UserResponse("testuser", "new@example.com", null);
        when(userService.updateMyProfile(any())).thenReturn(response);

        mockMvc.perform(patch("/api/profile")
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    void updateProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(patch("/api/profile").with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    // ===== DELETE /api/profile/delete =====

    @Test
    void deleteMyAccount_authenticated_returns204() throws Exception {
        doNothing().when(userService).deleteMyAccount(any(DeleteAccountRequest.class));

        mockMvc.perform(delete("/api/profile/delete")
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteMyAccount_unauthenticated_returns401() throws Exception {
        mockMvc.perform(delete("/api/profile/delete").with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteMyAccount_alreadyDeactivated_returns500() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account already deactivated"))
                .when(userService).deleteMyAccount(any(DeleteAccountRequest.class));

        mockMvc.perform(delete("/api/profile/delete")
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    // ===== GET /api/users/search =====

    @Test
    void searchUsers_authenticated_returnsResults() throws Exception {
        List<UserSearchResult> results = List.of(new UserSearchResult(2, "otheruser"));
        when(userService.searchUsers("other")).thenReturn(results);

        mockMvc.perform(get("/api/users/search")
                        .param("username", "other")
                        .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("otheruser"));
    }

    @Test
    void searchUsers_noResults_returnsEmptyList() throws Exception {
        when(userService.searchUsers("xyz")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/users/search")
                        .param("username", "xyz")
                        .with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void searchUsers_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/users/search").param("username", "test"))
                .andExpect(status().isUnauthorized());
    }
}
