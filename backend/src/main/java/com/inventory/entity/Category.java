package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="categories") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String name;
    private String description;
    @Column(updatable=false) private LocalDateTime createdAt;
    @OneToMany(mappedBy="category") private List<Product> products = new ArrayList<>();
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); }
}
