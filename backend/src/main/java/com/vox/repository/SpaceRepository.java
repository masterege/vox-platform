package com.vox.repository;

import com.vox.model.Space;
import com.vox.model.SpaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpaceRepository extends JpaRepository<Space, UUID> {
    // Standard find
    List<Space> findByType(SpaceType type);

    // NEW: Find only spaces where the user is a member
    @Query("SELECT s FROM Space s JOIN SpaceMember sm ON s.id = sm.spaceId WHERE sm.userId = :userId")
    List<Space> findJoinedSpaces(UUID userId);

    // NEW: Find joined spaces AND filter by type
    @Query("SELECT s FROM Space s JOIN SpaceMember sm ON s.id = sm.spaceId WHERE sm.userId = :userId AND s.type = :type")
    List<Space> findJoinedSpacesByType(UUID userId, SpaceType type);

    List<Space> findByOwnerId(UUID ownerId);
}