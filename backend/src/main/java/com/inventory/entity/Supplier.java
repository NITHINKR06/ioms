package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity @Table(name="suppliers") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    @JdbcTypeCode(SqlTypes.VARCHAR) @Enumerated(EnumType.STRING) private SupplierStatus status = SupplierStatus.ACTIVE;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
