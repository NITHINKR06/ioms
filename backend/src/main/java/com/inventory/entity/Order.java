package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="orders") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String orderNumber;
    @ManyToOne @JoinColumn(name="customer_id") private Customer customer;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status = OrderStatus.PENDING;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal subtotal;
    @Column(precision=12,scale=2) private BigDecimal discount = BigDecimal.ZERO;
    @Column(precision=12,scale=2) private BigDecimal tax = BigDecimal.ZERO;
    @Column(nullable=false,precision=12,scale=2) private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING) private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    @Enumerated(EnumType.STRING) private PaymentMethod paymentMethod;
    private String shippingAddress;
    @Column(columnDefinition="TEXT") private String notes;
    @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true)
    private List<OrderItem> orderItems = new ArrayList<>();
    @ManyToOne @JoinColumn(name="created_by") private User createdBy;
    @Column(updatable=false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate void preUpdate(){ updatedAt=LocalDateTime.now(); }
}
