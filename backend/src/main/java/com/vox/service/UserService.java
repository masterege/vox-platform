package com.vox.service;

import com.vox.model.User;
import com.vox.model.UserStatus;
import com.vox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User login(String username, String password) {
        // In production, verify hash. Here we check plain text.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPasswordHash().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }

    public void changePassword(UUID userId, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPasswordHash(newPassword);
        userRepository.save(user);
    }

    public User register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        // Create new user with auto-generated Avatar
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(password)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + username)
                .status(UserStatus.ONLINE)
                .build();

        return userRepository.save(user);
    }
}