package com.inventory.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter
public class OrderItemRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
}
