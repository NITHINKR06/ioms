package com.inventory.repository;
import com.inventory.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public interface OrderRepository extends JpaRepository<Order,Long>, JpaSpecificationExecutor<Order> {
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);
    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.status='DELIVERED' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal sumRevenueByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query(value="SELECT DATE_FORMAT(created_at,'%Y-%m-%d') as date, COUNT(*) as orders, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE status!='CANCELLED' AND created_at >= :since GROUP BY DATE_FORMAT(created_at,'%Y-%m-%d') ORDER BY date", nativeQuery=true)
    List<Object[]> findDailySalesData(@Param("since") LocalDateTime since);
    @Query(value="SELECT p.name, SUM(oi.quantity) as totalSold, SUM(oi.total_price) as totalRevenue FROM order_items oi JOIN products p ON oi.product_id=p.id JOIN orders o ON oi.order_id=o.id WHERE o.status!='CANCELLED' GROUP BY p.id,p.name ORDER BY totalSold DESC LIMIT :limit", nativeQuery=true)
    List<Object[]> findTopProducts(@Param("limit") int limit);
    @Query("SELECT MAX(o.orderNumber) FROM Order o WHERE o.orderNumber LIKE CONCAT(:prefix,'%')")
    Optional<String> findMaxOrderNumberByPrefix(@Param("prefix") String prefix);
}
