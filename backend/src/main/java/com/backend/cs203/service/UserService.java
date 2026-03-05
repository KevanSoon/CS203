package com.backend.cs203.service;

import java.time.Instant;
import java.util.List;
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
import com.backend.cs203.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SupabaseStorageService supabaseStorageService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        String profilePictureUrl = user.getProfilePictureUrl();
        String signedUrl = (profilePictureUrl != null)
                ? supabaseStorageService.getSignedUrl(profilePictureUrl, 3600)
                : null;

        return new UserResponse(
            user.getUsername(),
            user.getEmail(),
            signedUrl
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
        email = email.trim();
        if (email.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email too long (max 100)");
        }
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }

        user.setEmail(email);

        // ✅ validate username 
        String newUsername = request.getUsername();
        if (newUsername != null && !newUsername.isBlank()) {
            newUsername = newUsername.trim();
            if (newUsername.length() < 3) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username too short (min 3)");
            }
            if (newUsername.length() > 30) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username too long (max 30)");
            }
            if (!newUsername.matches("^[a-zA-Z0-9_]+$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username can only contain letters, numbers, underscores");
            }
            if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
            }
            user.setUsername(newUsername);
        }

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
        return new UserResponse(saved.getUsername(), saved.getEmail(), saved.getProfilePictureUrl());
    }

    private String requireUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return auth.getName();
    }

    private void validatePassword(String password) {
        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password too short (min 8)");
        }
        if (password.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password too long (max 100)");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one lowercase letter");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one uppercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must have at least one number");
        }
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

    public boolean checkUsernameAvailable(String username) {
        if (username == null || username.isBlank()) return false;
        username = username.trim();

        // still allow current user's own username to pass as "available"
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            if (username.equals(auth.getName())) return true;
        }

        return !userRepository.existsByUsername(username);
    }
}
