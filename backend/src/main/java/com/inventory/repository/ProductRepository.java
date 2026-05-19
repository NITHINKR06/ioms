package com.inventory.repository;

import com.inventory.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product,Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);
    @Query("SELECT p FROM Product p WHERE p.quantityInStock <= p.reorderLevel AND p.status = 'ACTIVE'")
    List<Product> findLowStockProducts();
    @Query("SELECT MAX(p.sku) FROM Product p WHERE p.sku LIKE CONCAT('PRD-', :code, '-%')")
    Optional<String> findMaxSkuByPrefix(@Param("code") String code);
}
