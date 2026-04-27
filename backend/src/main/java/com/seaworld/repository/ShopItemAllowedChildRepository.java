package com.seaworld.repository;

import com.seaworld.entity.ShopItemAllowedChild;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopItemAllowedChildRepository extends JpaRepository<ShopItemAllowedChild, UUID> {

    /**
     * 查询某商品允许的所有孩子ID
     */
    List<ShopItemAllowedChild> findByShopItemId(UUID shopItemId);

    /**
     * 检查某孩子是否可以购买某商品
     */
    boolean existsByShopItemIdAndChildId(UUID shopItemId, UUID childId);

    /**
     * 删除某商品的所有孩子关联（清空限制=所有孩子可买）
     */
    @Modifying
    @Query("DELETE FROM ShopItemAllowedChild s WHERE s.shopItemId = :shopItemId")
    void deleteByShopItemId(UUID shopItemId);

    /**
     * 统计某商品关联的孩子数量
     */
    long countByShopItemId(UUID shopItemId);
}
