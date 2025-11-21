package com.vox.repository;

import com.vox.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    @Query("SELECT c FROM Conversation c WHERE (c.user1Id = :u1 AND c.user2Id = :u2) OR (c.user1Id = :u2 AND c.user2Id = :u1)")
    Optional<Conversation> findExisting(UUID u1, UUID u2);

    @Query("SELECT c FROM Conversation c WHERE c.user1Id = :userId OR c.user2Id = :userId")
    List<Conversation> findByUserId(UUID userId);
}