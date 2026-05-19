package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity @Table(name="customers") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(unique=true) private String email;
    private String phone;
    private String address;
    @JdbcTypeCode(SqlTypes.VARCHAR) @Enumerated(EnumType.STRING) private CustomerType type = CustomerType.RETAIL;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
