package com.backend.cs203.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.repository.FriendshipRepository;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import com.backend.cs203.dto.profile.FriendDto;
import com.backend.cs203.entity.Friendship;
import com.backend.cs203.entity.FriendshipStatus;
import com.backend.cs203.entity.User;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService supabaseStorageService;

    private FriendDto toFriendDto(User user) {
    String profileUrl = null;

    try {
        String storedPath = user.getProfilePictureUrl();
        if (storedPath != null && !storedPath.isBlank()) {
        profileUrl = supabaseStorageService.getSignedUrl(storedPath, 3600);
        }

    } catch (Exception e) {
        profileUrl = null;
    }

    return new FriendDto(user.getId(), user.getUsername(), profileUrl);
    }

    public List<FriendDto> getFriends(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friendship> friendships = friendshipRepository.findFriendshipsByUserId(
                user.getId(),
                FriendshipStatus.confirmed
            );

        return friendships.stream()
            .map(f -> {
                if (f.getUser1().getId().equals(user.getId())) {
                    return toFriendDto(f.getUser2());
                } else {
                    return toFriendDto(f.getUser1());
                }
            })
            .toList();
    }

    public List<FriendDto> getPendingRequests(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friendship> incoming = friendshipRepository
                .findIncomingPending(user.getId());

        return incoming.stream()
                .map(f -> toFriendDto(f.getUser1()))
                .toList();
    }

    public List<FriendDto> getOutgoingRequests(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friendship> outgoing = friendshipRepository
                .findOutgoingPending(user.getId());

        return outgoing.stream()
                .map(f -> toFriendDto(f.getUser2()))
                .toList();
    }

    @Transactional
    public void sendFriendRequest(Integer targetUserId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot add yourself");
        }

        boolean exists = friendshipRepository
                .findExistingFriendship(currentUser.getId(), targetUser.getId())
                .isPresent();
        if (exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friendship already exists or pending");
        }

        Friendship friendship = new Friendship(
            currentUser, targetUser, FriendshipStatus.pending
        );

        friendshipRepository.save(friendship);
    }

    @Transactional
    public void cancelOutgoingRequest(Integer targetUserId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Friendship friendship = friendshipRepository
                .findExistingFriendship(currentUser.getId(), targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Request not found"));

        if (!friendship.getUser1().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Not your outgoing request"
            );
        }

        if (friendship.getStatus() != FriendshipStatus.pending) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot cancel confirmed friendship"
            );
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional
    public void acceptFriendRequest(Integer requesterId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friendship friendship = friendshipRepository
                .findExistingFriendship(requesterId, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Friend request not found"
                ));

        if (!friendship.getUser2().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You are not the recipient of this request"
            );
        }

        if (friendship.getStatus() != FriendshipStatus.pending) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Request already handled"
            );
        }

        friendship.setStatus(FriendshipStatus.confirmed);
    }

    @Transactional
    public void rejectFriendRequest(Integer requesterId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friendship friendship = friendshipRepository
                .findIncomingRequest(requesterId, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Friend request not found"
                ));

        friendshipRepository.delete(friendship);
    }

    @Transactional
    public void removeFriend(Integer friendId, String currentUsername) {

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friendship friendship = friendshipRepository
                .findExistingFriendship(currentUser.getId(), friendId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Friendship not found"
                ));

        if (friendship.getStatus() != FriendshipStatus.confirmed) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot remove non-confirmed friendship"
            );
        }

        friendshipRepository.delete(friendship);
    }
}