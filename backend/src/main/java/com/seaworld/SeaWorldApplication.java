package com.seaworld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SeaWorldApplication {

    public static void main(String[] args) {
        SpringApplication.run(SeaWorldApplication.class, args);
    }
}
