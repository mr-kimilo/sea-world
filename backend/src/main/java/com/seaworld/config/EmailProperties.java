package com.seaworld.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {

    private String from;
    private String frontendBaseUrl;
    private Verification verification = new Verification();

    @Data
    public static class Verification {
        private String subject;
        private String bodyTemplate;
        private String verifyPath;
    }
}
