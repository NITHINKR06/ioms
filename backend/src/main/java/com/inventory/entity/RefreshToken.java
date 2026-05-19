package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name="refresh_tokens") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false,length=512) private String token;
    @ManyToOne @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(nullable=false) private LocalDateTime expiryDate;
    private boolean revoked = false;
    private LocalDateTime createdAt;
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
