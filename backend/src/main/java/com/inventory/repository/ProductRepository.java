package com.inventory.repository;
import com.inventory.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.query.QueryHints;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.*;
import java.util.*;
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
