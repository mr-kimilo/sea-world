package com.seaworld.repository;

import com.seaworld.entity.OrderStatus;
import com.seaworld.entity.PurchaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseRecordRepository extends JpaRepository<PurchaseRecord, UUID> {

    /**
     * 查询某孩子的所有订单（按时间倒序）
     */
    List<PurchaseRecord> findByChildIdOrderByPurchasedAtDesc(UUID childId);

    /**
     * 查询某孩子特定状态的订单
     */
    List<PurchaseRecord> findByChildIdAndStatusOrderByPurchasedAtDesc(UUID childId, OrderStatus status);

    /**
     * 查询某孩子的待确认订单
     */
    default List<PurchaseRecord> findPendingOrdersByChildId(UUID childId) {
        return findByChildIdAndStatusOrderByPurchasedAtDesc(childId, OrderStatus.PENDING);
    }

    /**
     * 查询某孩子的已完成订单
     */
    default List<PurchaseRecord> findCompletedOrdersByChildId(UUID childId) {
        return findByChildIdAndStatusOrderByPurchasedAtDesc(childId, OrderStatus.COMPLETED);
    }

    /**
     * 根据ID和孩子ID查询订单（防止越权）
     */
    Optional<PurchaseRecord> findByIdAndChildId(UUID id, UUID childId);
}
