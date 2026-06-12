package com.seaworld.util;

public enum ResponseMessages {

    // Auth
    REGISTER_SUCCESS("注册成功，请查收验证邮件"),
    EMAIL_VERIFIED("邮箱验证成功"),
    VERIFICATION_RESENT("验证邮件已重新发送"),
    LOGIN_SUCCESS("登录成功"),
    TOKEN_REFRESHED("Token 刷新成功"),

    // Family
    FAMILY_CREATED("Family created"),
    FAMILY_UPDATED("Family updated"),
    CHILD_ADDED("Child added"),
    CHILD_UPDATED("Child updated"),
    CHILD_DELETED("Child deleted"),

    // Score
    SCORE_RECORDED("Score recorded"),
    SCORE_DELETED("Score deleted"),

    // Custom Score Category
    CUSTOM_CATEGORY_CREATED("自定义维度创建成功"),
    CUSTOM_CATEGORY_UPDATED("自定义维度更新成功"),
    CUSTOM_CATEGORY_DELETED("自定义维度删除成功"),

    // Shop
    PURCHASE_SUCCESS("Purchase successful"),
    PRODUCT_CREATED("Product created successfully"),
    PRODUCT_UPDATED("Product updated successfully"),
    PRODUCT_DELETED("Product deleted successfully"),
    ORDER_CONFIRMED("Order confirmed successfully"),
    ORDER_CANCELLED("Order cancelled successfully"),

    // Task
    TASK_CREATED("任务创建成功"),
    TASK_UPDATED("任务更新成功"),
    TASK_DELETED("任务删除成功"),
    TASK_COMPLETED("任务完成"),
    TASK_CANCELLED("任务已取消"),

    // Trophy
    TROPHIES_RETRIEVED("获取奖杯列表成功"),

    // Family Join
    JOIN_REQUEST_SENT("加入申请已发送，等待审批"),
    JOIN_REQUEST_APPROVED("已同意加入申请"),
    JOIN_REQUEST_REJECTED("已拒绝加入申请"),
    MEMBER_REMOVED("成员已移除"),

    // OAuth
    OAUTH_LOGIN_SUCCESS("第三方登录成功");

    private final String message;

    ResponseMessages(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
