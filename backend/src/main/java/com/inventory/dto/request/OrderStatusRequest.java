package com.inventory.dto.request;
import com.inventory.entity.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Getter @Setter
public class OrderStatusRequest {
    @NotNull private OrderStatus status;
    private PaymentStatus paymentStatus;
}
