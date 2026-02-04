package com.backend.cs203.dto.auth;

import com.backend.cs203.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {
    private boolean success;
    private String message;
    private UserData user;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserData {
        private String username;
        private String email;
        private String usertype;
        private Integer streak;
        private Instant createdAt;

        public UserData(User user){
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.usertype = user.getUsertype().name();
            this.streak = user.getStreak();
            this.createdAt = user.getCreatedAt();
        }
    }
}
