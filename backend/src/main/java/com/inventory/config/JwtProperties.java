package com.inventory.config;
import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component @ConfigurationProperties(prefix="app.jwt") @Getter @Setter
public class JwtProperties {
    private String secret = "3f4b8c2d1e9a7f6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1";
    private long accessTokenExpiryMs = 900000;
    private long refreshTokenExpiryMs = 604800000;
}
