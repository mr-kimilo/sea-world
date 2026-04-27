package com.seaworld.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 商品可购买孩子关联表
 * 当表中无记录时，表示所有孩子都可以购买该商品
 * 当表中有记录时，仅限记录中的孩子可以购买
 */
@Entity
@Table(
    name = "shop_item_allowed_children",
    uniqueConstraints = @UniqueConstraint(columnNames = {"shop_item_id", "child_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopItemAllowedChild {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_item_id", nullable = false)
    private UUID shopItemId;

    @Column(name = "child_id", nullable = false)
    private UUID childId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
