package com.vox.service;

import com.vox.model.Channel;
import com.vox.model.ChannelType;
import com.vox.model.Space;
import com.vox.model.SpaceMember;
import com.vox.model.SpaceType;
import com.vox.repository.ChannelRepository;
import com.vox.repository.SpaceMemberRepository;
import com.vox.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final ChannelRepository channelRepository;

    @Transactional
    public Space createSpace(String name, UUID ownerId, SpaceType type) {
        // 1. Save Space
        Space space = spaceRepository.save(Space.builder()
                .name(name).ownerId(ownerId).type(type).isPublic(true).build());

        // 2. Add Owner
        spaceMemberRepository.save(SpaceMember.builder()
                .spaceId(space.getId()).userId(ownerId).nickname("Owner").build());

        // 3. Create Default "General" Channel
        createChannel(space.getId(), "general", ChannelType.TEXT);

        return space;
    }

    public Channel createChannel(UUID spaceId, String name, ChannelType type) {
        return channelRepository.save(Channel.builder()
                .spaceId(spaceId).name(name).type(type).build());
    }

    public List<Space> getAllSpaces(SpaceType typeFilter) {
        return typeFilter != null ? spaceRepository.findByType(typeFilter) : spaceRepository.findAll();
    }

    public List<Channel> getChannels(UUID spaceId) {
        return channelRepository.findBySpaceId(spaceId);
    }

    public void deleteSpace(UUID spaceId) {
        spaceRepository.deleteById(spaceId);
    }

    public void deleteChannel(UUID channelId) {
        channelRepository.deleteById(channelId);
    }
}