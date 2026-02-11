package com.backend.cs203.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message="Username is required.")
    @Size(max=50,message = "Username cannot be longer than 50 characters.")
    @Pattern(regexp = "^[a-zA-Z0-9_!@]+$", message = "Username can only contain letters, numbers, and underscores.")
    private String username;

    @NotBlank(message="Email is required.")
    @Email(message="Please enter a valid email address.")
    @Size(max=100,message = "Email cannot be longer than 100 characters.")
    private String email;

    @NotBlank(message="Password is required.")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", message = "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    private String password;
    
    @NotBlank(message="Please select a user type.")
    @Pattern(regexp = "^(user|admin|root)$", message = "Invalid user type.")
    private String usertype;
}
