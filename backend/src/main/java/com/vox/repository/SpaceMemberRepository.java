package com.vox.repository;

import com.vox.model.SpaceMember;
import com.vox.model.SpaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpaceMemberRepository extends JpaRepository<SpaceMember, SpaceMemberId> {
    List<SpaceMember> findByUserId(UUID userId);
}