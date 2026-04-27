package com.seaworld.service;

import com.seaworld.config.EmailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    public EmailService(JavaMailSender mailSender, EmailProperties emailProperties) {
        this.mailSender = mailSender;
        this.emailProperties = emailProperties;
    }

    /**
     * 同步发送邮件（供需要确认发送结果的场景使用）
     */
    public void sendVerificationEmail(String toEmail, String verifyToken) {
        try {
            EmailProperties.Verification v = emailProperties.getVerification();
            String verifyUrl = emailProperties.getFrontendBaseUrl()
                    + v.getVerifyPath() + "?token=" + verifyToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailProperties.getFrom());
            message.setTo(toEmail);
            message.setSubject(v.getSubject());
            message.setText(String.format(v.getBodyTemplate(), verifyUrl));

            mailSender.send(message);
            log.info("Verification email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", toEmail, e);
            // 不抛出异常，避免影响注册流程
        }
    }

    /**
     * 异步发送验证邮件（推荐使用，不阻塞主线程）
     */
    @Async
    public void sendVerificationEmailAsync(String toEmail, String verifyToken) {
        try {
            sendVerificationEmail(toEmail, verifyToken);
        } catch (Exception e) {
            log.error("异步发送邮件失败: {}", e.getMessage());
        }
    }
}
