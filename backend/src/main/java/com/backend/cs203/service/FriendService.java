package com.backend.cs203.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.FriendshipRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.dto.profile.FriendDto;
import com.backend.cs203.entity.Friendship;
import com.backend.cs203.entity.FriendshipStatus;
import com.backend.cs203.entity.User;

@Service
public class FriendService {

    private final FriendshipRepository friendshipRepository;

    private final UserRepository userRepository;

    public FriendService(FriendshipRepository friendshipRepository, UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
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
                    return new FriendDto(f.getUser2().getUsername());
                } else {
                    return new FriendDto(f.getUser1().getUsername());
                }
            })
            .toList();
    }
}