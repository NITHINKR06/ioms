package com.inventory.dto.response;
import lombok.*;
import java.util.Set;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private boolean enabled;
    private Set<String> roles;
}
