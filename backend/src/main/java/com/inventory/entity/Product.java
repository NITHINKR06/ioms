package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name="products") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String sku;
    @Column(nullable=false) private String name;
    private String description;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal price;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal costPrice;
    @Column(nullable=false) private Integer quantityInStock = 0;
    @Column(nullable=false) private Integer reorderLevel = 10;
    private String imageUrl;
    @Enumerated(EnumType.STRING) private ProductStatus status = ProductStatus.ACTIVE;
    @ManyToOne @JoinColumn(name="category_id",nullable=false) private Category category;
    @ManyToOne @JoinColumn(name="supplier_id") private Supplier supplier;
    @ManyToOne @JoinColumn(name="created_by") private User createdBy;
    @Column(updatable=false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate void preUpdate(){ updatedAt=LocalDateTime.now(); }
}
