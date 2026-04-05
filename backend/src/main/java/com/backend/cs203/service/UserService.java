package com.backend.cs203.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserProfileDto;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;

public interface UserService {

    @Transactional
    public RegisterResponse registerUser(RegisterRequest request);

    @Transactional
    public UserResponse getMyProfile();

    @Transactional
    public void deleteMyAccount(DeleteAccountRequest request);

    @Transactional(readOnly = true)
    public boolean verifyMyPassword(String password);

    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request);

    public List<UserSearchResult> searchUsers(String username);

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Integer targetId);

}
