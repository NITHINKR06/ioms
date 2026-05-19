package com.inventory.dto.request;
import com.inventory.entity.CustomerType;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter
public class CustomerRequest {
    @NotBlank private String name;
    @Email private String email;
    private String phone;
    private String address;
    private CustomerType type;
}
