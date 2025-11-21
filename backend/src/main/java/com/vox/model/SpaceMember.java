package com.vox.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "space_members")
@IdClass(SpaceMemberId.class)
public class SpaceMember {

    @Id
    @Column(name = "space_id")
    private UUID spaceId;

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String nickname;

    @CreationTimestamp
    private LocalDateTime joinedAt;
}