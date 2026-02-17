package com.backend.cs203.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cs203.service.FriendService;

import org.springframework.web.bind.annotation.GetMapping;

import com.backend.cs203.dto.profile.FriendDto;


@RestController
@RequestMapping("/api/friendship")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    @GetMapping
    public List<FriendDto> getMyFriends(Authentication authentication) {
        return friendService.getFriends(authentication.getName());
    }
}

