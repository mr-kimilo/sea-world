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
    ORDER_CANCELLED("Order cancelled successfully");

    private final String message;

    ResponseMessages(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
