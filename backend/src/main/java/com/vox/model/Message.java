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
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 2000)
    private String content;

    // New Field for Images/Files
    private String attachmentUrl;

    @Column(name = "channel_id", nullable = false)
    private UUID channelId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    private User author;

    @CreationTimestamp
    private LocalDateTime createdAt;
}