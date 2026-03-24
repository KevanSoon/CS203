package com.backend.cs203.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.backend.cs203.dto.auth.RegisterRequest;
import com.backend.cs203.dto.auth.RegisterResponse;
import com.backend.cs203.dto.profile.DeleteAccountRequest;
import com.backend.cs203.dto.profile.UpdateProfileRequest;
import com.backend.cs203.dto.profile.UserResponse;
import com.backend.cs203.dto.profile.UserSearchResult;
import com.backend.cs203.entity.User;
import com.backend.cs203.entity.UserLessonProgress.ProgressStatus;
import com.backend.cs203.repository.UserLessonProgressRepository;
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SupabaseStorageService supabaseStorageService;
    private final UserRepository userRepository;
    private final UserLessonProgressRepository userLessonProgressRepository;
    private final PasswordEncoder passwordEncoder;

    private void validatePassword(String password) {
        if (password.length() < 8 || password.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Password must be 8–100 characters long");
        }

        boolean hasLower = false;
        boolean hasUpper = false;
        boolean hasDigit = false;

        for (int i = 0; i < password.length(); i++) {
            char c = password.charAt(i);

            if (c >= 'a' && c <= 'z') hasLower = true;
            else if (c >= 'A' && c <= 'Z') hasUpper = true;
            else if (c >= '0' && c <= '9') hasDigit = true;

            if (hasLower && hasUpper && hasDigit) break;
        }

        if (!hasLower || !hasUpper || !hasDigit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Password must contain uppercase, lowercase, and a number");
        }
    }

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\\.[A-Za-z]{2,}$");

    private String validateEmail(String email) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        email = email.trim();

        if (email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (email.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email too long (max 100)");
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        return email;
    }



    @Transactional
    public RegisterResponse registerUser(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return new RegisterResponse(false, "Username already in use. Try another", null);
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(false, "Email already in use. Try another", null);
        }

        User.UserType userType;
        try {
            userType = User.UserType.valueOf(request.getUsertype());
        } catch (IllegalArgumentException e) {
            return new RegisterResponse(false, "Invalid user type. Try again", null);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .usertype(userType)
                .streak(0)
                .createdAt(Instant.now())
                .build();

        User savedUser = userRepository.save(user);
        RegisterResponse.UserData userData =new RegisterResponse.UserData(savedUser);

        return new RegisterResponse(true, "User registered successfully", userData);
    }

    @Transactional
    public UserResponse getMyProfile() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null ||
            !auth.isAuthenticated() ||
            auth instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getDeactivatedAt() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account deactivated");
        }

        boolean streakBroken = checkAndResetStreak(user);

        String profilePictureUrl = user.getProfilePictureUrl();
        String signedUrl = (profilePictureUrl != null)
                ? supabaseStorageService.getSignedUrl(profilePictureUrl, 3600)
                : null;

        long totalCompletedLessons = userLessonProgressRepository
                .countByUserIdAndStatus(user.getId(), ProgressStatus.completed);

        return new UserResponse(
            user.getUsername(),
            user.getEmail(),
            signedUrl,
            user.getStreak(),
            user.getLastStreakDate(),
            totalCompletedLessons,
            streakBroken
        );
    }

    @Transactional
    public void deleteMyAccount(DeleteAccountRequest request) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Auth required");
        }

        if (request == null || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
        }

        String currentUsername = auth.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect password");
        }

        Instant now = Instant.now();
        user.setUsername(user.getUsername() + "_" + now.toEpochMilli());
        user.setDeactivatedAt(now);

        userRepository.save(user);
        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public boolean verifyMyPassword(String password) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null ||
            !auth.isAuthenticated() ||
            auth instanceof AnonymousAuthenticationToken) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Auth required");
        }

        if (password == null || password.isBlank()) {
            return false;
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return passwordEncoder.matches(password, user.getPassword());
    }

    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        String username = requireUsername();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // ✅ validate email (required)
        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        
        email = validateEmail(request.getEmail());
        user.setEmail(email);

        // ✅ password optional
        String password = request.getPassword();
        if (password != null && !password.isBlank()) {
            validatePassword(password);
            user.setPassword(passwordEncoder.encode(password));
        }

        // ✅ profile image (optional)
        MultipartFile profileImage = request.getProfileImage();
        if (profileImage != null && !profileImage.isEmpty()) {
            String existingUrl = user.getProfilePictureUrl();

            //check if there is image url in database
            if (existingUrl != null) {
                //delete file from supabase storage
                supabaseStorageService.deleteFile(existingUrl);
            }

            //upload new image and store url path
            String newPath = supabaseStorageService.uploadFile("profile-pictures/" + user.getId(), profileImage);
            user.setProfilePictureUrl(newPath);
        }

        User saved = userRepository.save(user);
        long totalCompletedLessons = userLessonProgressRepository
                .countByUserIdAndStatus(saved.getId(), ProgressStatus.completed);
        String signedUrl = saved.getProfilePictureUrl() != null
                ? supabaseStorageService.getSignedUrl(saved.getProfilePictureUrl(), 3600)
                : null;
        return new UserResponse(saved.getUsername(), saved.getEmail(), signedUrl,
                saved.getStreak(), saved.getLastStreakDate(), totalCompletedLessons, false);
    }

    private boolean checkAndResetStreak(User user) {
        LocalDate lastStreakDate = user.getLastStreakDate();
        if (lastStreakDate != null && lastStreakDate.isBefore(LocalDate.now().minusDays(1))) {
            user.setStreak(0);
            user.setLastStreakDate(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    private String requireUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return auth.getName();
    }

    public List<UserSearchResult> searchUsers(String username) {
        String currentUsername = requireUsername();

        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return userRepository.findTop3ByUsernameContainingIgnoreCase(username)
                .stream()
                .filter(user -> !user.getUsername().equals(currentUsername))
                .filter(user -> user.getUsertype() == currentUser.getUsertype())
                .map(user -> new UserSearchResult(user.getId(), user.getUsername()))
                .collect(Collectors.toList());
    }
}
