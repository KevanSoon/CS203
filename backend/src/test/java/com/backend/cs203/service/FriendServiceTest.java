package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

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

@ExtendWith(MockitoExtension.class)
class FriendServiceTest {

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FriendService friendService;

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

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> friendService.getFriends("nonexistent"));
        assertEquals("User not found", ex.getMessage());
    }
}
