package com.vox.repository;

import com.vox.model.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, UUID> {
    List<DirectMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
}