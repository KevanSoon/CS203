package com.backend.cs203.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.entity.User;
import com.backend.cs203.repository.FriendshipRepository;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;
import com.backend.cs203.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private SupabaseStorageService supabaseStorageService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private UserLessonProgressRepository userLessonProgressRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @AfterEach
    void cleanup() {
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
        when(supabaseStorageService.getSignedUrl("http://pic.url", 3600)).thenReturn("http://signed.url");
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any())).thenReturn(5L);

        UserResponse result = userService.getMyProfile();

        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("http://signed.url", result.getProfilePictureUrl());
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
    void deleteMyAccount_incorrectPassword_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser")
                .password("encodedPassword")
                .build();

        DeleteAccountRequest request = new DeleteAccountRequest();
        request.setPassword("wrongPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

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

    @Test
    void deleteMyAccount_nullRequest_throwsBadRequest() {
        setAuthentication("testuser");
        assertThrows(ResponseStatusException.class, () -> userService.deleteMyAccount(null));
    }

    @Test
    void deleteMyAccount_blankPassword_throwsBadRequest() {
        setAuthentication("testuser");

        DeleteAccountRequest request = new DeleteAccountRequest();
        request.setPassword(" ");

        assertThrows(ResponseStatusException.class,
                () -> userService.deleteMyAccount(request));
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
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any())).thenReturn(0L);

        UpdateProfileRequest request = new UpdateProfileRequest("new@example.com", null, null);
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
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any())).thenReturn(0L);

        UpdateProfileRequest request = new UpdateProfileRequest("test@example.com", "NewPassword1", null);
        userService.updateMyProfile(request);

        assertEquals("newEncoded", user.getPassword());
    }

    @Test
    void updateMyProfile_blankEmail_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("", null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_invalidEmailFormat_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("not-an-email", null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_shortPassword_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("test@example.com", "Ab1", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_nullEmail_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest(null, null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> userService.updateMyProfile(request));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_emailTooLong_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        String longEmail = "a".repeat(101) + "@test.com";

        UpdateProfileRequest request = new UpdateProfileRequest(longEmail, null, null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));

        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_passwordMissingUppercase_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request =
                new UpdateProfileRequest("test@test.com", "lowercase1", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_passwordMissingDigit_throwsBadRequest() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UpdateProfileRequest request = new UpdateProfileRequest("test@test.com", "Password", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.updateMyProfile(request));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void updateMyProfile_withProfileImage_uploadsFile() {
        setAuthentication("testuser");

        User user = User.builder()
                .id(1)
                .username("testuser")
                .email("test@test.com")
                .profilePictureUrl(null)
                .build();

        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);

        when(file.isEmpty()).thenReturn(false);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(supabaseStorageService.uploadFile(any(), eq(file))).thenReturn("new-path");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any()))
                .thenReturn(0L);

        UpdateProfileRequest request = new UpdateProfileRequest("test@test.com", null, file);

        userService.updateMyProfile(request);

        verify(supabaseStorageService).uploadFile(any(), eq(file));
    }

    @Test
    void updateMyProfile_replaceProfileImage_deletesOldFile() {
        setAuthentication("testuser");

        User user = User.builder()
                .id(1)
                .username("testuser")
                .email("test@test.com")
                .profilePictureUrl("old-path")
                .build();

        MultipartFile file = org.mockito.Mockito.mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(supabaseStorageService.uploadFile(any(), eq(file))).thenReturn("new-path");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any()))
                .thenReturn(0L);

        UpdateProfileRequest request = new UpdateProfileRequest("test@test.com", null, file);

        userService.updateMyProfile(request);

        verify(supabaseStorageService).deleteFile("old-path");
    }

    // ===== checkAndResetStreak (via getMyProfile) =====

    @Test
    void getMyProfile_brokenStreak_resetsToZeroAndStreakBrokenTrue() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser").email("test@example.com")
                .streak(5).lastStreakDate(LocalDate.now().minusDays(3))
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals(0, result.getStreak());
        assertTrue(result.isStreakBroken());
        verify(userRepository).save(user);
    }

    @Test
    void getMyProfile_missedExactlyTwoDays_resetsToZeroAndStreakBrokenTrue() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser").email("test@example.com")
                .streak(3).lastStreakDate(LocalDate.now().minusDays(2))
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals(0, result.getStreak());
        assertTrue(result.isStreakBroken());
        verify(userRepository).save(user);
    }

    @Test
    void getMyProfile_streakValidYesterday_noResetAndStreakBrokenFalse() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser").email("test@example.com")
                .streak(3).lastStreakDate(LocalDate.now().minusDays(1))
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals(3, result.getStreak());
        assertFalse(result.isStreakBroken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getMyProfile_streakCountedToday_noResetAndStreakBrokenFalse() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser").email("test@example.com")
                .streak(4).lastStreakDate(LocalDate.now())
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals(4, result.getStreak());
        assertFalse(result.isStreakBroken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getMyProfile_noStreakYet_noResetAndStreakBrokenFalse() {
        setAuthentication("testuser");
        User user = User.builder()
                .username("testuser").email("test@example.com")
                .streak(0).lastStreakDate(null)
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        UserResponse result = userService.getMyProfile();

        assertEquals(0, result.getStreak());
        assertFalse(result.isStreakBroken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getMyProfile_noProfilePicture_returnsNullUrl() {
        setAuthentication("testuser");

        User user = User.builder()
                .username("testuser")
                .email("test@example.com")
                .profilePictureUrl(null)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userLessonProgressRepository.countCompletedApprovedLessonsByUserId(any()))
                .thenReturn(0L);

        UserResponse result = userService.getMyProfile();

        assertEquals(null, result.getProfilePictureUrl());
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

    @Test
    void searchUsers_currentUserNotFound_throwsNotFound() {
        setAuthentication("missing");

        when(userRepository.findByUsername("missing")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> userService.searchUsers("test"));
    }

    // ===== verifyMyPassword() =====

    @Test
    void verifyMyPassword_correctPassword_returnsTrue() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").password("encoded").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("raw", "encoded")).thenReturn(true);

        assertTrue(userService.verifyMyPassword("raw"));
    }

    @Test
    void verifyMyPassword_wrongPassword_returnsFalse() {
        setAuthentication("testuser");
        User user = User.builder().username("testuser").password("encoded").build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);
        
        assertFalse(userService.verifyMyPassword("wrong"));
    }

    @Test
    void verifyMyPassword_blankPassword_returnsFalse() {
        setAuthentication("testuser");
        assertFalse(userService.verifyMyPassword(""));
    }

    @Test
    void verifyMyPassword_unauthenticated_throwsUnauthorized() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.verifyMyPassword("test"));
        assertEquals(401, ex.getStatusCode().value());
    }

    // ===== requireUsername() =====
    @Test
    void requireUsername_nullAuthenticationName_throwsUnauthorized() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(null, null));

        assertThrows(ResponseStatusException.class,
                () -> userService.searchUsers("test"));
    }
    

    // ===== getUserProfile() =====
    @Test
    void getUserProfile_success() {
        setAuthentication("viewer");

        User viewer = User.builder().id(1).username("viewer").build();
        User target = User.builder()
        .id(2)
        .username("target")
        .usertype(User.UserType.user)
        .build();

        when(userRepository.findByUsername("viewer")).thenReturn(Optional.of(viewer));
        when(userRepository.findById(2)).thenReturn(Optional.of(target));
        when(friendshipRepository.findFriendshipsByUserId(any(), any()))
                .thenReturn(List.of());
        when(friendshipRepository.findSentPendingRequest(any(), any()))
                .thenReturn(Optional.empty());

        var result = userService.getUserProfile(2);

        assertEquals("target", result.getUsername());
    }

    @Test
    void getUserProfile_deactivatedTarget_throwsNotFound() {
        setAuthentication("viewer");

        User viewer = User.builder().id(1).username("viewer").build();
        User target = User.builder()
                .id(2)
                .username("target")
                .usertype(User.UserType.user) 
                .deactivatedAt(java.time.Instant.now())
                .build();

        when(userRepository.findByUsername("viewer")).thenReturn(Optional.of(viewer));
        when(userRepository.findById(2)).thenReturn(Optional.of(target));

        assertThrows(ResponseStatusException.class,
                () -> userService.getUserProfile(2));
    }

}
