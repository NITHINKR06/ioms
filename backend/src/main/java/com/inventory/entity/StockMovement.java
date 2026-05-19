package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="stock_movements") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="product_id",nullable=false) private Product product;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private MovementType type;
    @Column(nullable=false) private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String referenceNo;
    private String notes;
    @ManyToOne @JoinColumn(name="created_by") private User createdBy;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
