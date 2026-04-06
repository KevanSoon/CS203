package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.backend.cs203.dto.profile.FriendDto;
import com.backend.cs203.entity.Friendship;
import com.backend.cs203.entity.FriendshipStatus;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.FriendshipRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.exception.Exceptions.AuthException;
import com.backend.cs203.service.impl.FriendServiceImpl;

import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class FriendServiceTest {

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FriendServiceImpl friendService;

    // ===== getFriends =====

    @Test
    void getFriends_asUser1_returnsFriendUsername() {
        User me = User.builder().id(1).username("me").build();
        User friend = User.builder().id(2).username("myfriend").build();
        Friendship friendship = new Friendship(me, friend, FriendshipStatus.confirmed);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(1, FriendshipStatus.confirmed))
                .thenReturn(List.of(friendship));

        List<FriendDto> result = friendService.getFriends("me");

        assertEquals(1, result.size());
        assertEquals("myfriend", result.get(0).getUsername());
    }

    @Test
    void getFriends_asUser2_returnsFriendUsername() {
        User other = User.builder().id(1).username("other").build();
        User me = User.builder().id(2).username("me").build();
        Friendship friendship = new Friendship(other, me, FriendshipStatus.confirmed);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(2, FriendshipStatus.confirmed))
                .thenReturn(List.of(friendship));

        List<FriendDto> result = friendService.getFriends("me");

        assertEquals(1, result.size());
        assertEquals("other", result.get(0).getUsername());
    }

    @Test
    void getFriends_noFriends_returnsEmptyList() {
        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(1, FriendshipStatus.confirmed))
                .thenReturn(Collections.emptyList());

        List<FriendDto> result = friendService.getFriends("me");

        assertTrue(result.isEmpty());
    }

    @Test
    void getFriends_multipleFriends_returnsAll() {
        User me = User.builder().id(1).username("me").build();
        User friend1 = User.builder().id(2).username("friend1").build();
        User friend2 = User.builder().id(3).username("friend2").build();

        Friendship f1 = new Friendship(me, friend1, FriendshipStatus.confirmed);
        Friendship f2 = new Friendship(friend2, me, FriendshipStatus.confirmed);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(1, FriendshipStatus.confirmed))
                .thenReturn(List.of(f1, f2));

        List<FriendDto> result = friendService.getFriends("me");

        assertEquals(2, result.size());
        assertEquals("friend1", result.get(0).getUsername());
        assertEquals("friend2", result.get(1).getUsername());
    }

    @Test
    void getFriends_userNotFound_throwsException() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class,
                () -> friendService.getFriends("nonexistent"));
        assertEquals("User not found", ex.getMessage());
    }

    // ===== getPendingRequests =====
    @Test
    void getPendingRequests_returnsIncomingRequests() {
        User me = User.builder().id(1).username("me").build();
        User requester = User.builder().id(2).username("requester").build();

        Friendship friendship = new Friendship(requester, me, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findIncomingPending(1)).thenReturn(List.of(friendship));

        List<FriendDto> result = friendService.getPendingRequests("me");

        assertEquals(1, result.size());
        assertEquals("requester", result.get(0).getUsername());
    }

    @Test
    void getPendingRequests_none_returnsEmptyList() {
        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findIncomingPending(1)).thenReturn(Collections.emptyList());

        List<FriendDto> result = friendService.getPendingRequests("me");

        assertTrue(result.isEmpty());
    }


    // ===== getOutgoingRequests =====
    @Test
    void getOutgoingRequests_returnsOutgoingRequests() {
        User me = User.builder().id(1).username("me").build();
        User target = User.builder().id(2).username("target").build();

        Friendship friendship = new Friendship(me, target, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findOutgoingPending(1)).thenReturn(List.of(friendship));

        List<FriendDto> result = friendService.getOutgoingRequests("me");

        assertEquals(1, result.size());
        assertEquals("target", result.get(0).getUsername());
    }


    // ===== sendFriendRequest =====
    @Test
    void sendFriendRequest_success_savesFriendship() {

        User me = User.builder().id(1).username("me").build();
        User target = User.builder().id(2).username("target").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(userRepository.findById(2)).thenReturn(Optional.of(target));
        when(friendshipRepository.findExistingFriendship(1, 2)).thenReturn(Optional.empty());

        friendService.sendFriendRequest(2, "me");
    }

    @Test
    void sendFriendRequest_selfRequest_throwsException() {

        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(userRepository.findById(1)).thenReturn(Optional.of(me));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.sendFriendRequest(1, "me"));

        assertEquals("400 BAD_REQUEST \"Cannot add yourself\"", ex.getMessage());
    }

    @Test
    void sendFriendRequest_existingFriendship_throwsException() {

        User me = User.builder().id(1).username("me").build();
        User target = User.builder().id(2).username("target").build();

        Friendship existing = new Friendship(me, target, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(userRepository.findById(2)).thenReturn(Optional.of(target));
        when(friendshipRepository.findExistingFriendship(1, 2))
                .thenReturn(Optional.of(existing));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.sendFriendRequest(2, "me"));

        assertEquals("400 BAD_REQUEST \"Friendship already exists or pending\"", ex.getMessage());
    }


    // ===== cancelOutgoingRequest =====
    @Test
    void cancelOutgoingRequest_success_deletesRequest() {

        User me = User.builder().id(1).username("me").build();
        User target = User.builder().id(2).username("target").build();

        Friendship friendship = new Friendship(me, target, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2))
                .thenReturn(Optional.of(friendship));

        friendService.cancelOutgoingRequest(2, "me");
    }

    @Test
    void cancelOutgoingRequest_notFound_throwsException() {

        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.cancelOutgoingRequest(2, "me"));

        assertEquals("404 NOT_FOUND \"Request not found\"", ex.getMessage());
    }


    // ===== acceptFriendRequest =====

    @Test
    void acceptFriendRequest_success_setsConfirmed() {

        User requester = User.builder().id(1).username("requester").build();
        User me = User.builder().id(2).username("me").build();

        Friendship friendship = new Friendship(requester, me, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2))
                .thenReturn(Optional.of(friendship));

        friendService.acceptFriendRequest(1, "me");

        assertEquals(FriendshipStatus.confirmed, friendship.getStatus());
    }

    @Test
    void acceptFriendRequest_notFound_throwsException() {

        User me = User.builder().id(2).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.acceptFriendRequest(1, "me"));

        assertEquals("404 NOT_FOUND \"Friend request not found\"", ex.getMessage());
    }

    // ===== rejectFriendRequest =====
    @Test
    void rejectFriendRequest_success_deletesRequest() {

        User requester = User.builder().id(1).username("requester").build();
        User me = User.builder().id(2).username("me").build();

        Friendship friendship = new Friendship(requester, me, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findIncomingRequest(1, 2))
                .thenReturn(Optional.of(friendship));

        friendService.rejectFriendRequest(1, "me");
    }

    @Test
    void rejectFriendRequest_notFound_throwsException() {

        User me = User.builder().id(2).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findIncomingRequest(1, 2))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.rejectFriendRequest(1, "me"));

        assertEquals("404 NOT_FOUND \"Friend request not found\"", ex.getMessage());
    }
    
    @Test
    void removeFriend_success_deletesFriendship() {
        User me = User.builder().id(1).username("me").build();
        User friend = User.builder().id(2).username("friend").build();
        Friendship friendship = new Friendship(me, friend, FriendshipStatus.confirmed);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2)).thenReturn(Optional.of(friendship));

        friendService.removeFriend(2, "me");
    }

    @Test
    void removeFriend_notConfirmed_throwsException() {
        User me = User.builder().id(1).username("me").build();
        User friend = User.builder().id(2).username("friend").build();
        Friendship friendship = new Friendship(me, friend, FriendshipStatus.pending);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2)).thenReturn(Optional.of(friendship));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.removeFriend(2, "me"));

        assertEquals("400 BAD_REQUEST \"Cannot remove non-confirmed friendship\"", ex.getMessage());
    }

    @Test
    void removeFriend_notFound_throwsException() {
        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findExistingFriendship(1, 2)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> friendService.removeFriend(2, "me"));

        assertEquals("404 NOT_FOUND \"Friendship not found\"", ex.getMessage());
    }

    @Test
    void getFriendsSortedByStreak_returnsFriendsSortedByStreakDescending() {
        User me = User.builder().id(1).username("me").build();
        User friend1 = User.builder().id(2).username("friend1").streak(5).lastStreakDate(LocalDate.now()).build();
        User friend2 = User.builder().id(3).username("friend2").streak(10).lastStreakDate(LocalDate.now()).build();
        User friend3 = User.builder().id(4).username("friend3").streak(3).lastStreakDate(LocalDate.now()).build();

        Friendship f1 = new Friendship(me, friend1, FriendshipStatus.confirmed);
        Friendship f2 = new Friendship(me, friend2, FriendshipStatus.confirmed);
        Friendship f3 = new Friendship(me, friend3, FriendshipStatus.confirmed);

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(1, FriendshipStatus.confirmed))
                .thenReturn(List.of(f1, f2, f3));

        List<FriendDto> result = friendService.getFriendsSortedByStreak("me");

        assertEquals(3, result.size());
        assertEquals("friend2", result.get(0).getUsername());
        assertEquals("friend1", result.get(1).getUsername());
        assertEquals("friend3", result.get(2).getUsername());
    }

    @Test
    void getFriendsSortedByStreak_noFriends_returnsEmptyList() {
        User me = User.builder().id(1).username("me").build();

        when(userRepository.findByUsername("me")).thenReturn(Optional.of(me));
        when(friendshipRepository.findFriendshipsByUserId(1, FriendshipStatus.confirmed))
                .thenReturn(Collections.emptyList());

        List<FriendDto> result = friendService.getFriendsSortedByStreak("me");

        assertTrue(result.isEmpty());
    }
}
