package com.inventory.dto.request;
import com.inventory.entity.SupplierStatus;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter
public class SupplierRequest {
    @NotBlank private String name;
    private String contactPerson;
    @Email private String email;
    private String phone;
    private String address;
    private SupplierStatus status;
}
