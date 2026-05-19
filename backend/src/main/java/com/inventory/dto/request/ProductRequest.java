package com.inventory.dto.request;
import com.inventory.entity.ProductStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Getter @Setter
public class ProductRequest {
    @NotBlank private String name;
    private String description;
    @NotNull @DecimalMin("0.01") private BigDecimal price;
    @NotNull @DecimalMin("0.01") private BigDecimal costPrice;
    @NotNull @Min(0) private Integer quantityInStock;
    @NotNull @Min(0) private Integer reorderLevel;
    private String imageUrl;
    private ProductStatus status;
    @NotNull private Long categoryId;
    private Long supplierId;
}
