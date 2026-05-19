package com.inventory.repository;
import com.inventory.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface StockMovementRepository extends JpaRepository<StockMovement,Long> {
    Page<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable p);
    @Query("SELECT COALESCE(SUM(m.quantity),0) FROM StockMovement m WHERE m.type=:type")
    long sumByType(@Param("type") MovementType type);
}
