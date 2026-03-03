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
                    return new FriendDto(f.getUser2().getUsername());
                } else {
                    return new FriendDto(f.getUser1().getUsername());
                }
            })
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

        boolean exists = friendshipRepository.existsByUser1IdAndUser2Id(currentUser.getId(), targetUser.getId());
        if (exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend request already sent");
        }

        Friendship friendship = new Friendship(
            currentUser, targetUser, FriendshipStatus.pending
        );

        friendshipRepository.save(friendship);
    }
}