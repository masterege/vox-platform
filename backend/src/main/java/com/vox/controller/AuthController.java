package com.vox.controller;

import com.vox.model.User;
import com.vox.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return userService.login(request.username(), request.password());
    }

    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest request) {
        userService.changePassword(request.userId(), request.newPassword());
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.register(request.username(), request.email(), request.password());
    }

    // DTOs
    public record LoginRequest(String username, String password) {
    }

    public record ChangePasswordRequest(UUID userId, String newPassword) {
    }

    public record RegisterRequest(String username, String email, String password) {
    }
}