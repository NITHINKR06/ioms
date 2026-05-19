package com.inventory.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name="roles") @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @JdbcTypeCode(SqlTypes.VARCHAR) @Enumerated(EnumType.STRING) @Column(unique=true,nullable=false) private RoleName name;
}
