package com.vox.controller;

import com.vox.model.Channel;
import com.vox.model.ChannelType;
import com.vox.model.Space;
import com.vox.model.SpaceMember;
import com.vox.model.SpaceType;
import com.vox.repository.ChannelRepository; // Needed to find spaceId before delete
import com.vox.repository.SpaceMemberRepository;
import com.vox.repository.SpaceRepository;
import com.vox.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SpaceController {

    private final SpaceService spaceService;
    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final ChannelRepository channelRepository; // Injected
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<Space> getSpaces(@RequestParam UUID userId, @RequestParam(required = false) SpaceType type) {
        if (type != null)
            return spaceRepository.findJoinedSpacesByType(userId, type);
        return spaceRepository.findJoinedSpaces(userId);
    }

    @PostMapping
    public Space createSpace(@RequestBody CreateSpaceRequest request) {
        return spaceService.createSpace(request.name(), request.ownerId(), request.type());
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable UUID id) {
        spaceService.deleteSpace(id);
    }

    @PostMapping("/{spaceId}/join")
    public ResponseEntity<String> joinSpace(@PathVariable UUID spaceId, @RequestBody JoinRequest request) {
        if (!spaceRepository.existsById(spaceId))
            return ResponseEntity.status(404).body("Server not found.");
        boolean isMember = spaceMemberRepository.findByUserId(request.userId()).stream()
                .anyMatch(m -> m.getSpaceId().equals(spaceId));
        if (isMember)
            return ResponseEntity.status(409).body("Already a member.");
        spaceMemberRepository
                .save(SpaceMember.builder().spaceId(spaceId).userId(request.userId()).nickname("Member").build());
        return ResponseEntity.ok("Joined successfully!");
    }

    @GetMapping("/{spaceId}/channels")
    public List<Channel> getChannels(@PathVariable UUID spaceId) {
        return spaceService.getChannels(spaceId);
    }

    @PostMapping("/{spaceId}/channels")
    public Channel createChannel(@PathVariable UUID spaceId, @RequestBody CreateChannelRequest request) {
        Channel channel = spaceService.createChannel(spaceId, request.name(), request.type());
        // BROADCAST CREATE
        messagingTemplate.convertAndSend("/topic/space/" + spaceId, new SpaceEvent("CHANNEL_CREATED", channel, null));
        return channel;
    }

    @DeleteMapping("/channels/{channelId}")
    public void deleteChannel(@PathVariable UUID channelId) {
        // Find space ID before deleting to broadcast event
        channelRepository.findById(channelId).ifPresent(channel -> {
            UUID spaceId = channel.getSpaceId();
            spaceService.deleteChannel(channelId);
            // BROADCAST DELETE
            messagingTemplate.convertAndSend("/topic/space/" + spaceId,
                    new SpaceEvent("CHANNEL_DELETED", null, channelId.toString()));
        });
    }

    public record CreateSpaceRequest(String name, SpaceType type, UUID ownerId) {
    }

    public record CreateChannelRequest(String name, ChannelType type) {
    }

    public record JoinRequest(UUID userId) {
    }

    public record SpaceEvent(String type, Channel payload, String deletedId) {
    }
}