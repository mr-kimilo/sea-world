package com.seaworld.entity;

/**
 * 订单状态枚举
 * 与数据库 purchase_records.status 字段对应
 */
public enum OrderStatus {
    /**
     * 待确认 - 已下单，积分已暂扣，待确认消费
     */
    PENDING,

    /**
     * 已完成 - 已确认消费，积分已真实扣除
     */
    COMPLETED,

    /**
     * 已取消 - 订单已取消，积分已返还
     */
    CANCELLED
}
