package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="users") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(unique=true,nullable=false) private String username;
    @Column(unique=true,nullable=false) private String email;
    @Column(nullable=false) private String password;
    private String fullName;
    private boolean enabled = true;
    @Column(updatable=false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @ManyToMany(fetch=FetchType.EAGER)
    @JoinTable(name="user_roles",joinColumns=@JoinColumn(name="user_id"),inverseJoinColumns=@JoinColumn(name="role_id"))
    private Set<Role> roles = new HashSet<>();
    @PrePersist void prePersist(){ createdAt=LocalDateTime.now(); updatedAt=LocalDateTime.now(); }
    @PreUpdate void preUpdate(){ updatedAt=LocalDateTime.now(); }
}
