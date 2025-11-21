package com.vox.model;

import com.fasterxml.jackson.annotation.JsonProperty; // <--- NEW IMPORT
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "friends", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "friend_id" })
})
public class Friend {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "friend_id", nullable = false)
    private UUID friendId;

    @Builder.Default
    @JsonProperty("isFavorite") // <--- FORCES JSON TO USE "isFavorite"
    private boolean isFavorite = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "friend_id", insertable = false, updatable = false)
    private User friendProfile;
}