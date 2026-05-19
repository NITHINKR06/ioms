package com.inventory.dto.request;
import com.inventory.entity.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
@Getter @Setter
public class OrderRequest {
    private Long customerId;
    @NotEmpty private List<OrderItemRequest> items;
    private BigDecimal discount;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private String notes;
}
