package com.seaworld.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "score_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "child_id", nullable = false)
    private UUID childId;

    @Column(name = "operator_id", nullable = false)
    private UUID operatorId;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ScoreCategory category;

    @Column(name = "custom_category_id")
    private UUID customCategoryId;

    @Column(nullable = false)
    private String reason;

    @Column(name = "raw_voice_text")
    private String rawVoiceText;

    @Column(name = "record_date", nullable = false)
    @Builder.Default
    private LocalDate recordDate = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
