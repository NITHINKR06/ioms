package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="audit_logs") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    @Column(columnDefinition="TEXT") private String oldValues;
    @Column(columnDefinition="TEXT") private String newValues;
    private String ipAddress;
    @ManyToOne @JoinColumn(name="performed_by") private User performedBy;
    @Column(updatable=false) private LocalDateTime createdAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
