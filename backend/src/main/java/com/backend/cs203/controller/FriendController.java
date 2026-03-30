package com.backend.cs203.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.dto.profile.FriendDto;
import com.backend.cs203.service.FriendService;

@RestController
@RequestMapping("/api/friendship")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public ResponseEntity<List<FriendDto>> getMyFriends(Authentication authentication) {
        validateAuth(authentication);
        return ResponseEntity.ok(
                friendService.getFriends(authentication.getName())
        );
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendDto>> getPending(Authentication authentication) {
        validateAuth(authentication);
        return ResponseEntity.ok(
                friendService.getPendingRequests(authentication.getName())
        );
    }

    @GetMapping("/pending/outgoing")
    public ResponseEntity<List<FriendDto>> getOutgoing(Authentication authentication) {
        validateAuth(authentication);
        return ResponseEntity.ok(
                friendService.getOutgoingRequests(authentication.getName())
        );
    }

    @PostMapping("/pending/outgoing/{id}")
    public ResponseEntity<Void> sendFriendRequest(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        validateAuth(authentication);
        friendService.sendFriendRequest(id, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/pending/outgoing/{id}")
    public ResponseEntity<Void> cancelRequest(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        validateAuth(authentication);
        friendService.cancelOutgoingRequest(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}")
    public ResponseEntity<Void> acceptFriend(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        validateAuth(authentication);
        friendService.acceptFriendRequest(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    private void validateAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> rejectFriend(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        validateAuth(authentication);

        friendService.rejectFriendRequest(id, authentication.getName());

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFriend(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        validateAuth(authentication);
        friendService.removeFriend(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<FriendDto>> getFriendsLeaderboard(Authentication authentication) {
        validateAuth(authentication);
        return ResponseEntity.ok(friendService.getFriendsSortedByStreak(authentication.getName()));
    }
}