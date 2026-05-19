package com.inventory.dto.response;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
