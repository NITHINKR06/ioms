package com.inventory.repository;
import com.inventory.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
public interface SupplierRepository extends JpaRepository<Supplier,Long> {
    Page<Supplier> findByStatus(SupplierStatus status, Pageable p);
}
