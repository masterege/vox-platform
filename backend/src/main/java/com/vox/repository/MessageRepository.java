package com.vox.repository;

import com.vox.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    // Fetch messages for a specific channel, ordered by time
    List<Message> findByChannelIdOrderByCreatedAtAsc(UUID channelId);
}