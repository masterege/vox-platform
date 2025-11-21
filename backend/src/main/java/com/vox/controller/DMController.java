package com.vox.controller;

import com.vox.model.Conversation;
import com.vox.model.DirectMessage;
import com.vox.repository.ConversationRepository;
import com.vox.repository.DirectMessageRepository;
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
@RequestMapping("/api/dm")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DMController {

        private final ConversationRepository conversationRepository;
        private final DirectMessageRepository dmRepository;
        private final SimpMessagingTemplate messagingTemplate;
        private final UserRepository userRepository;

        @PostMapping("/start")
        public Conversation startConversation(@RequestBody StartDMRequest req) {
                return conversationRepository.findExisting(req.user1Id(), req.user2Id())
                                .orElseGet(() -> conversationRepository.save(
                                                Conversation.builder().user1Id(req.user1Id()).user2Id(req.user2Id())
                                                                .build()));
        }

        @GetMapping("/{conversationId}/messages")
        public List<DMResponse> getMessages(@PathVariable UUID conversationId) {
                return dmRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                                .map(this::toResponse).toList();
        }

        @MessageMapping("/dm/{conversationId}")
        public void sendDM(@Payload DMRequest req, @DestinationVariable UUID conversationId) {
                DirectMessage dm = DirectMessage.builder()
                                .conversationId(conversationId)
                                .authorId(req.authorId())
                                .encryptedContent(req.encryptedContent())
                                .attachmentUrl(req.attachmentUrl())
                                .build();

                DirectMessage saved = dmRepository.save(dm);
                DMResponse response = toResponse(saved);

                // FETCH CONVERSATION TO FIND RECIPIENTS
                Conversation convo = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new RuntimeException("Conversation not found"));

                // BROADCAST TO BOTH USERS PRIVATE TOPICS
                // This fixes the "Other user not listening" bug
                messagingTemplate.convertAndSend("/topic/private/" + convo.getUser1Id(), response);
                messagingTemplate.convertAndSend("/topic/private/" + convo.getUser2Id(), response);
        }

        private DMResponse toResponse(DirectMessage dm) {
                String username = userRepository.findById(dm.getAuthorId()).map(u -> u.getUsername()).orElse("Unknown");
                return new DMResponse(dm.getId(), dm.getEncryptedContent(), dm.getAttachmentUrl(), dm.getAuthorId(),
                                username, dm.getCreatedAt().toString(), dm.getConversationId());
        }

        public record StartDMRequest(UUID user1Id, UUID user2Id) {
        }

        public record DMRequest(String encryptedContent, String attachmentUrl, UUID authorId) {
        }

        // Added conversationId to response so frontend knows where it belongs
        public record DMResponse(UUID id, String content, String attachmentUrl, UUID authorId, String username,
                        String timestamp, UUID conversationId) {
        }
}