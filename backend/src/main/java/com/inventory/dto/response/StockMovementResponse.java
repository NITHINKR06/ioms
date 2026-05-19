package com.inventory.dto.response;
import com.inventory.entity.MovementType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private MovementType type;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String referenceNo;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
}
