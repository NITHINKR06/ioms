package com.inventory.dto.response;
import com.inventory.entity.CustomerType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private CustomerType type;
    private LocalDateTime createdAt;
}
