package com.backend.cs203.controller;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.cs203.config.SecurityConfig;
import com.backend.cs203.dto.profile.FriendDto;
import com.backend.cs203.security.JwtAuthenticationFilter;
import com.backend.cs203.security.JwtUtil;
import com.backend.cs203.service.FriendService;

@WebMvcTest(FriendController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class FriendControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FriendService friendService;

    @MockitoBean
    private JwtUtil jwtUtil;

    // ===== GET /api/friendship =====

    @Test
    void getMyFriends_authenticated_returns200() throws Exception {
        List<FriendDto> friends = List.of(
                new FriendDto(1, "friend1", null, 0, false),
                new FriendDto(2, "friend2", null, 0, false)
        );

        when(friendService.getFriends("testuser")).thenReturn(friends);

        mockMvc.perform(get("/api/friendship").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("friend1"))
                .andExpect(jsonPath("$[1].username").value("friend2"));
    }

    @Test
    void getMyFriends_noFriends_returnsEmptyList() throws Exception {
        when(friendService.getFriends("testuser")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/friendship").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getMyFriends_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/friendship"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getMyFriends_serviceThrowsException_returns400() throws Exception {
        when(friendService.getFriends("testuser"))
                .thenThrow(new RuntimeException("User not found"));

        mockMvc.perform(get("/api/friendship").with(user("testuser").roles("USER")))
                .andExpect(status().isBadRequest());
    }
    

    // ===== GET /api/friendship/pending =====

    @Test
    void getPendingRequests_returnsPendingList() throws Exception {
        List<FriendDto> pending = List.of(
                new FriendDto(3, "pendingUser", null, 0, false)
        );

        when(friendService.getPendingRequests("testuser")).thenReturn(pending);

        mockMvc.perform(get("/api/friendship/pending").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("pendingUser"));
    }

    @Test
    void getPending_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/friendship/pending"))
            .andExpect(status().isUnauthorized());
    }

    // ===== GET /api/friendship/pending/outgoing =====

    @Test
    void getOutgoingRequests_returnsOutgoingList() throws Exception {
        List<FriendDto> outgoing = List.of(
                new FriendDto(4, "outgoingUser", null, 0, false)
        );

        when(friendService.getOutgoingRequests("testuser")).thenReturn(outgoing);

        mockMvc.perform(get("/api/friendship/pending/outgoing").with(user("testuser").roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("outgoingUser"));
    }

    // ===== POST /api/friendship/{id} =====

    @Test
    void sendFriendRequest_returns201() throws Exception {

        mockMvc.perform(post("/api/friendship/pending/outgoing/5").with(user("testuser").roles("USER")))
                .andExpect(status().isCreated());
    }

    @Test
    void sendFriendRequest_serviceThrows_returns400() throws Exception {
        doThrow(new RuntimeException("error"))
            .when(friendService).sendFriendRequest(5, "testuser");

        mockMvc.perform(post("/api/friendship/pending/outgoing/5")
            .with(user("testuser").roles("USER")))
            .andExpect(status().isBadRequest());
    }

    // ===== DELETE /api/friendship/{id} =====

    @Test
    void cancelFriendRequest_returns204() throws Exception {

        mockMvc.perform(delete("/api/friendship/pending/outgoing/5").with(user("testuser").roles("USER")))
                .andExpect(status().isNoContent());
    }

    // ===== POST /api/friendship/accept/{id} =====

    @Test
    void acceptFriendRequest_returns200() throws Exception {

        mockMvc.perform(post("/api/friendship/5").with(user("testuser").roles("USER")))
                .andExpect(status().isOk());
    }

    // ===== POST /api/friendship/reject/{id} =====

    @Test
    void rejectFriendRequest_returns204() throws Exception {

        mockMvc.perform(post("/api/friendship/reject/5").with(user("testuser").roles("USER")))
                .andExpect(status().isNoContent());
    }

    // ===== DELETE /api/friendship/{id} =====

    @Test
    void removeFriend_returns204() throws Exception {
        mockMvc.perform(delete("/api/friendship/5")
            .with(user("testuser").roles("USER")))
            .andExpect(status().isNoContent());
    }

    // ===== GET /api/friendship/leaderboard =====

    @Test
    void getLeaderboard_returnsSortedFriends() throws Exception {
        List<FriendDto> leaderboard = List.of(
            new FriendDto(1, "topUser", null, 10, false)
        );

        when(friendService.getFriendsSortedByStreak("testuser"))
            .thenReturn(leaderboard);

        mockMvc.perform(get("/api/friendship/leaderboard")
            .with(user("testuser").roles("USER")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].username").value("topUser"));
    }
}
