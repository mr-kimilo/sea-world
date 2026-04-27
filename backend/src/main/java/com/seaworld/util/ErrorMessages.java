package com.seaworld.util;

public enum ErrorMessages {

    // Auth
    EMAIL_ALREADY_REGISTERED("该邮箱已被注册"),
    DAILY_REGISTRATION_LIMIT("今日注册名额已满，请明天再试"),
    INVALID_EMAIL_OR_PASSWORD("邮箱或密码错误"),
    EMAIL_NOT_VERIFIED("请先验证邮箱"),
    INVALID_REFRESH_TOKEN("无效的刷新 Token"),
    REFRESH_TOKEN_EXPIRED("刷新 Token 已过期，请重新登录"),
    USER_NOT_FOUND("用户不存在"),
    INVALID_VERIFY_LINK("验证链接无效"),
    VERIFY_LINK_EXPIRED("验证链接已过期，请重新发送"),
    EMAIL_ALREADY_VERIFIED("邮箱已验证，无需重复验证"),

    // Family
    FAMILY_NOT_FOUND("Family not found"),
    NOT_FAMILY_MEMBER("You are not a member of this family"),
    CHILD_NOT_FOUND("Child not found"),
    CHILD_NOT_IN_FAMILY("Child does not belong to this family"),

    // Shop
    ITEM_NOT_FOUND("Shop item not found"),
    ITEM_NOT_AVAILABLE("Item is not available for purchase"),
    CHILD_ALREADY_OWNS_ITEM("Child already owns this item"),
    INSUFFICIENT_SCORE("Insufficient available score"),
    NO_ACCESS_TO_CHILD("You do not have access to this child's data"),
    ITEM_NOT_ALLOWED_FOR_CHILD("This item is not allowed for the selected child"),
    ORDER_NOT_FOUND("Order not found"),
    ORDER_ALREADY_COMPLETED("Order is already completed"),
    ORDER_ALREADY_CANCELLED("Order is already cancelled"),
    CANNOT_CANCEL_COMPLETED_ORDER("Cannot cancel a completed order"),

    // Score — 包含 %d 占位符，通过 format(limit) 填入上限值
    DAILY_POSITIVE_LIMIT_EXCEEDED("每日正向积分上限（%d 分）已达到"),
    DAILY_NEGATIVE_LIMIT_EXCEEDED("每日负向积分上限（%d 分）已达到"),
    SCORE_NOT_FOUND("Score record not found"),
    CANNOT_DELETE_OTHERS_SCORE("You cannot delete other users' score records"),

    // Custom Score Category
    CUSTOM_CATEGORY_NOT_FOUND("自定义积分维度不存在"),
    CUSTOM_CATEGORY_NAME_DUPLICATED("维度名称【%s】已存在"),
    CUSTOM_CATEGORY_HAS_SCORES("该维度有 %d 条积分记录，删除维度会同时删除这些记录"),
    UNAUTHORIZED_OPERATION("无权限执行此操作");

    private final String message;

    ErrorMessages(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    /** 用于带占位符的消息，如 DAILY_POSITIVE_LIMIT_EXCEEDED.format(10) */
    public String format(Object... args) {
        return String.format(message, args);
    }
}
