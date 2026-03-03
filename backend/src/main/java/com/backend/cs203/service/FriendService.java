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
                    return new FriendDto(
                        f.getUser2().getId(),
                        f.getUser2().getUsername()
                    );
                } else {
                    return new FriendDto(
                        f.getUser1().getId(),
                        f.getUser1().getUsername()
                    );
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
                .map(f -> new FriendDto(
                    f.getUser1().getId(),
                    f.getUser1().getUsername()
                ))
                .toList();
    }

    public List<FriendDto> getOutgoingRequests(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friendship> outgoing = friendshipRepository
                .findOutgoingPending(user.getId());

        return outgoing.stream()
                .map(f -> new FriendDto(
                    f.getUser2().getId(),
                    f.getUser2().getUsername()
                ))
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
                "Not authorized to accept this request"
            );
        }

        friendship.setStatus(FriendshipStatus.confirmed);
    }

}