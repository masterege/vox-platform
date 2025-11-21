package com.vox.controller;

import com.vox.model.Message;
import com.vox.repository.ChannelRepository; // <--- Import
import com.vox.repository.MessageRepository;
import com.vox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChannelRepository channelRepository; // <--- Inject

    @GetMapping("/api/channels/{channelId}/messages")
    public List<MessageResponse> getHistory(@PathVariable UUID channelId) {
        return messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @MessageMapping("/chat/{channelId}")
    public void sendMessage(@Payload ChatMessageRequest request, @DestinationVariable UUID channelId) {
        Message message = Message.builder()
                .content(request.content())
                .attachmentUrl(request.attachmentUrl())
                .channelId(channelId)
                .authorId(request.authorId())
                .build();

        Message saved = messageRepository.save(message);
        saved.setAuthor(userRepository.findById(request.authorId()).orElse(null));

        messagingTemplate.convertAndSend("/topic/channel/" + channelId, convertToResponse(saved));
    }

    private MessageResponse convertToResponse(Message msg) {
        String username = (msg.getAuthor() != null) ? msg.getAuthor().getUsername() : "Unknown";

        // Fetch Space ID to help Frontend with Notifications
        UUID spaceId = channelRepository.findById(msg.getChannelId())
                .map(c -> c.getSpaceId())
                .orElse(null);

        return new MessageResponse(
                msg.getId(),
                msg.getContent(),
                msg.getAttachmentUrl(),
                msg.getAuthorId(),
                username,
                msg.getCreatedAt().toString(),
                spaceId // <--- Added
        );
    }

    public record ChatMessageRequest(String content, String attachmentUrl, UUID authorId) {
    }

    // Added spaceId to Response
    public record MessageResponse(UUID id, String content, String attachmentUrl, UUID authorId, String username,
            String timestamp, UUID spaceId) {
    }
}