package com.vox.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpaceMemberId implements Serializable {
    private UUID spaceId;
    private UUID userId;
}