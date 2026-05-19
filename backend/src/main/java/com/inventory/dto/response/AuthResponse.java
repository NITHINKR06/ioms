package com.inventory.dto.response;
import lombok.*;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserResponse user;
}
