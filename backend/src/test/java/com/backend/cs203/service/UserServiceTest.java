package com.backend.cs203.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setAuthentication(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of()));
    }

    // ===== registerUser =====

    @Test
    void registerUser_success_returnsSuccessResponse() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "Password1", "user");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn("encodedPw");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1);
            return u;
        });

        RegisterResponse result = userService.registerUser(request);

        assertTrue(result.isSuccess());
        assertEquals("User registered successfully", result.getMessage());
        assertNotNull(result.getUser());
        assertEquals("newuser", result.getUser().getUsername());
    }

    @Test
    void registerUser_duplicateUsername_returnsFailure() {
        RegisterRequest request = new RegisterRequest("existing", "new@example.com", "Password1", "user");
        when(userRepository.existsByUsername("existing")).thenReturn(true);

        RegisterResponse result = userService.registerUser(request);

        assertFalse(result.isSuccess());
        assertEquals("Username already in use. Try another", result.getMessage());
    }

    @Test
    void registerUser_duplicateEmail_returnsFailure() {
        RegisterRequest request = new RegisterRequest("newuser", "existing@example.com", "Password1", "user");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        RegisterResponse result = userService.registerUser(request);

        assertFalse(result.isSuccess());
        assertEquals("Email already in use. Try another", result.getMessage());
    }

    @Test
    void registerUser_invalidUserType_returnsFailure() {
        RegisterRequest request = new RegisterRequest("newuser", "new@example.com", "Password1", "INVALID");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

        RegisterResponse result = userService.registerUser(request);

        assertFalse(result.isSuccess());
        assertEquals("Invalid user type. Try again", result.getMessage());
    }

    // ===== getMyProfile =====

    @Test
    void getMyProfile_authenticated_returnsProfile() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .profilePictureUrl("http://pic.url")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("http://pic.url", result.getProfilePictureUrl());
    }

    @Test
    void getMyProfile_unauthenticated_throwsUnauthorized() {
        // no authentication set
        assertThrows(ResponseStatusException.class, () -> userService.getMyProfile());
    }

    @Test
    void getMyProfile_deactivatedUser_throwsForbidden() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .deactivatedAt(java.time.Instant.now())
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.getMyProfile());
        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void getMyProfile_userNotFound_throwsNotFound() {
        setAuthentication("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.getMyProfile());
        assertEquals(404, ex.getStatusCode().value());
    }

    // ===== deleteMyAccount =====

    @Test
    void deleteMyAccount_success_deactivatesUser() {
        setAuthentication("testuser");
        User user = User.builder()
                .id(1)
                .username("testuser")
                .password("encodedPassword")
                .build();

        DeleteAccountRequest request = new DeleteAccountRequest();
        request.setPassword("rawPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.deleteMyAccount(request);

        assertNotNull(user.getDeactivatedAt());
        assertTrue(user.getUsername().startsWith("testuser_"));
        verify(userRepository).save(user);
    }

    @Test
    void deleteMyAccount_alreadyDeactivated_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .deactivatedAt(java.time.Instant.now())
                .build();

        DeleteAccountRequest request = new DeleteAccountRequest();
        request.setPassword("rawPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.deleteMyAccount(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void deleteMyAccount_unauthenticated_throwsUnauthorized() {
        DeleteAccountRequest request = new DeleteAccountRequest();
        request.setPassword("rawPassword");
        assertThrows(ResponseStatusException.class, () -> userService.deleteMyAccount(request));
    }

    // ===== updateMyProfile =====

    @Test
    void updateMyProfile_validEmail_updatesProfile() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .email("old@example.com")
                .profilePictureUrl(null)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        UpdateProfileRequest request = new UpdateProfileRequest("new@example.com", null);
        UserResponse result = userService.updateMyProfile(request);

        assertEquals("new@example.com", result.getEmail());
    }

    @Test
    void updateMyProfile_withValidPassword_updatesPassword() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("oldEncoded")
                .profilePictureUrl(null)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPassword1")).thenReturn("newEncoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UpdateProfileRequest request = new UpdateProfileRequest("test@example.com", "NewPassword1");
        userService.updateMyProfile(request);

        assertEquals("newEncoded", user.getPassword());
    }

    @Test
    void updateMyProfile_blankEmail_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_invalidEmailFormat_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("not-an-email", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_shortPassword_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("test@example.com", "Ab1");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    // ===== searchUsers =====

    @Test
    void searchUsers_returnsFilteredResults() {
        setAuthentication("currentuser");
        User currentUser = User.builder()
                .id(1)
                .username("currentuser")
                .usertype(User.UserType.user)
                .build();

        User otherUser = User.builder()
                .id(2)
                .username("otheruser")
                .usertype(User.UserType.user)
                .build();

        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findTop3ByUsernameContainingIgnoreCase("user"))
                .thenReturn(List.of(currentUser, otherUser));

        List<UserSearchResult> results = userService.searchUsers("user");

        assertEquals(1, results.size());
        assertEquals("otheruser", results.get(0).getUsername());
    }

    @Test
    void searchUsers_excludesDifferentUserType() {
        setAuthentication("currentuser");
        User currentUser = User.builder()
                .id(1)
                .username("currentuser")
                .usertype(User.UserType.user)
                .build();

        User adminUser = User.builder()
                .id(2)
                .username("adminuser")
                .usertype(User.UserType.admin)
                .build();

        when(userRepository.findByUsername("currentuser")).thenReturn(Optional.of(currentUser));
        when(userRepository.findTop3ByUsernameContainingIgnoreCase("user"))
                .thenReturn(List.of(currentUser, adminUser));

        List<UserSearchResult> results = userService.searchUsers("user");

        assertTrue(results.isEmpty());
    }
}
