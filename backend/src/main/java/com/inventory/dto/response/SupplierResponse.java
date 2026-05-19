package com.inventory.dto.response;
import com.inventory.entity.SupplierStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class SupplierResponse {
    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private SupplierStatus status;
    private LocalDateTime createdAt;
}
