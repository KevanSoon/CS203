package com.backend.cs203.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.profile.FriendDto;

public interface FriendService {

    public List<FriendDto> getFriends(String username);

    public List<FriendDto> getPendingRequests(String username);
    
    public List<FriendDto> getOutgoingRequests(String username);

    @Transactional
    public void sendFriendRequest(Integer targetUserId, String currentUsername);

    @Transactional
    public void cancelOutgoingRequest(Integer targetUserId, String currentUsername);

    @Transactional
    public void acceptFriendRequest(Integer requesterId, String currentUsername);

    @Transactional
    public void rejectFriendRequest(Integer requesterId, String currentUsername);

    @Transactional
    public void removeFriend(Integer friendId, String currentUsername);
    
    public List<FriendDto> getFriendsSortedByStreak(String username);
    
}