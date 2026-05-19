package com.inventory.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter
public class RegisterRequest {
    @NotBlank @Size(min=3,max=50) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=8) private String password;
    private String fullName;
}
