package com.backend.cs203.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.cs203.repository.FriendshipRepository;
import com.backend.cs203.dto.profile.FriendDto;

@Service
public class FriendService {

    private final FriendshipRepository friendshipRepository;

    public FriendService(FriendshipRepository friendshipRepository) {
        this.friendshipRepository = friendshipRepository;
    }

    public List<FriendDto> getFriends(String username) {

        return friendshipRepository
                .findConfirmedFriendships(username)
                .stream()
                .map(f -> {
                    if (f.getRequester().equals(username)) {
                        return new FriendDto(f.getAcceptor());
                    } else {
                        return new FriendDto(f.getRequester());
                    }
                })
                .toList();
    }
}
