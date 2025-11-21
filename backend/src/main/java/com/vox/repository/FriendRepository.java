package com.vox.repository;

import com.vox.model.Friend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface FriendRepository extends JpaRepository<Friend, UUID> {
    List<Friend> findByUserId(UUID userId);

    boolean existsByUserIdAndFriendId(UUID userId, UUID friendId);

    @Transactional
    void deleteByUserIdAndFriendId(UUID userId, UUID friendId);
}