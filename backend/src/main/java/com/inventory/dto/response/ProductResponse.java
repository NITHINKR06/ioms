package com.inventory.dto.response;
import com.inventory.entity.ProductStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer quantityInStock;
    private Integer reorderLevel;
    private boolean lowStock;
    private String imageUrl;
    private ProductStatus status;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
