package com.seaworld.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "children_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"child_id", "item_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id", nullable = false)
    private UUID childId;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    private String nickname;

    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;

    @CreationTimestamp
    @Column(name = "acquired_at", nullable = false, updatable = false)
    private LocalDateTime acquiredAt;
}
