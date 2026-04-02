package com.backend.cs203.controller;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UserProfileDto;
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

    @Autowired
    private UserController userController;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ===== GET /api/profile =====

    @Test
    void getProfile_authenticated_returns200() throws Exception {
        UserResponse response = new UserResponse(1,"testuser", "test@example.com", null, 0, null, 0L, false);
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
    void getProfile_serviceThrowsException_returns400() throws Exception {
        when(userService.getMyProfile())
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        mockMvc.perform(get("/api/profile").with(user("testuser").roles("USER")))
                .andExpect(status().isBadRequest());
    }

    // ===== PATCH /api/profile =====

    @Test
    void updateProfile_authenticated_returns200() throws Exception {
        UserResponse response = new UserResponse(1,"testuser", "new@example.com", null, 0, null, 0L, false);
        when(userService.updateMyProfile(any())).thenReturn(response);

        mockMvc.perform(multipart("/api/profile")
                        .param("email", "new@example.com")
                        .with(request -> { request.setMethod("PATCH"); return request; })
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    void updateProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(multipart("/api/profile")
                        .with(request -> { request.setMethod("PATCH"); return request; })
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    // ===== DELETE /api/profile =====

    @Test
    void deleteMyAccount_authenticated_returns204() throws Exception {
        doNothing().when(userService).deleteMyAccount(any(DeleteAccountRequest.class));

        mockMvc.perform(delete("/api/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"testPassword\"}")
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteMyAccount_unauthenticated_returns401() throws Exception {
        mockMvc.perform(delete("/api/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"testPassword\"}")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteMyAccount_incorrectPassword_returns400() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect password"))
                .when(userService).deleteMyAccount(any(DeleteAccountRequest.class));

        mockMvc.perform(delete("/api/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"wrongPassword\"}")
                        .with(user("testuser").roles("USER"))
                        .with(csrf()))
                .andExpect(status().isBadRequest());
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

    @Test
    void getUserProfile_returnsProfile() {
    int userId = 42;
    UserProfileDto dto = mock(UserProfileDto.class);
    when(userService.getUserProfile(userId)).thenReturn(dto);

    ResponseEntity<UserProfileDto> response = userController.getUserProfile(userId);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(userService).getUserProfile(userId);
    }

    @Test
    void verifyPassword_returnsTrueWhenPasswordCorrect() {
        DeleteAccountRequest req = new DeleteAccountRequest();
        req.setPassword("secret");
        when(userService.verifyMyPassword("secret")).thenReturn(true);
        ResponseEntity<Boolean> response = userController.verifyPassword(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService).verifyMyPassword("secret");
    }

    @Test
    void verifyPassword_returnsFalseWhenPasswordIncorrect() {
        DeleteAccountRequest req = new DeleteAccountRequest();
        req.setPassword("wrong");
        when(userService.verifyMyPassword("wrong")).thenReturn(false);

        ResponseEntity<Boolean> response = userController.verifyPassword(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService).verifyMyPassword("wrong");
    }
}
