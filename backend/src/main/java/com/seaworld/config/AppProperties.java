package com.seaworld.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private String frontendUrl = "http://localhost:5173";
    private String corsAllowedOrigins = "http://localhost:5173";
    private Jwt jwt = new Jwt();
    private Security security = new Security();

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpiration = 900_000L;
        private long refreshTokenExpiration = 604_800_000L;
    }

    @Data
    public static class Security {
        private int maxDailyRegistrations = 50;
        private int maxRegisterPerIpPerHour = 3;
        private int emailVerificationExpiryHours = 24;
    }
}
