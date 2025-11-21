package com.vox.controller;

import com.vox.model.Friend;
import com.vox.model.User;
import com.vox.repository.FriendRepository;
import com.vox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FriendController {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public List<Friend> getFriends(@PathVariable UUID userId) {
        return friendRepository.findByUserId(userId);
    }

    @PostMapping("/add")
    public void addFriend(@RequestBody AddFriendRequest request) {
        User friendUser = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Add User -> Friend
        if (!friendRepository.existsByUserIdAndFriendId(request.userId(), friendUser.getId())) {
            friendRepository.save(Friend.builder().userId(request.userId()).friendId(friendUser.getId()).build());
        }
        // 2. Add Friend -> User
        if (!friendRepository.existsByUserIdAndFriendId(friendUser.getId(), request.userId())) {
            friendRepository.save(Friend.builder().userId(friendUser.getId()).friendId(request.userId()).build());
        }
    }

    @PostMapping("/remove")
    public void removeFriend(@RequestBody RemoveFriendRequest request) {
        friendRepository.deleteByUserIdAndFriendId(request.userId(), request.friendId());
        friendRepository.deleteByUserIdAndFriendId(request.friendId(), request.userId());
    }

    // --- NEW ENDPOINT ---
    @PutMapping("/{friendId}/favorite")
    public void toggleFavorite(@PathVariable UUID friendId, @RequestParam UUID userId) {
        // We need to find the specific relationship row
        // Ideally we would use a repository method to findByUserIdAndFriendId,
        // but filtering the list is safe enough for MVP or we add a custom query.
        // Let's assume we iterate or fetch specific.
        // Better approach: Add a find method in Repo or just filter here.

        List<Friend> friends = friendRepository.findByUserId(userId);
        Friend relation = friends.stream()
                .filter(f -> f.getFriendId().equals(friendId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        relation.setFavorite(!relation.isFavorite());
        friendRepository.save(relation);
    }

    public record AddFriendRequest(UUID userId, String username) {
    }

    public record RemoveFriendRequest(UUID userId, UUID friendId) {
    }
}