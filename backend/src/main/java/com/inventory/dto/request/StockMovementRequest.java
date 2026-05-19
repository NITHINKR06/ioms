package com.inventory.dto.request;
import com.inventory.entity.MovementType;
import jakarta.validation.constraints.*;
import lombok.*;
@Getter @Setter
public class StockMovementRequest {
    @NotNull private Long productId;
    @NotNull private MovementType type;
    @NotNull @Min(1) private Integer quantity;
    private String referenceNo;
    private String notes;
}
