package com.inventory.service;

import com.inventory.dto.response.DashboardStatsResponse;
import com.inventory.dto.response.DashboardStatsResponse.*;
import com.inventory.entity.OrderStatus;
import com.inventory.entity.ProductStatus;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class DashboardService {
    private final ProductRepository productRepo;
    private final OrderRepository orderRepo;

    public DashboardStatsResponse getStats() {
        long totalProducts = productRepo.findAll().stream()
            .filter(p -> p.getStatus() == ProductStatus.ACTIVE).count();
        long totalOrders = orderRepo.count();
        long pendingOrders = orderRepo.countByStatus(OrderStatus.PENDING);
        long lowStockCount = productRepo.findLowStockProducts().size();

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDateTime.now();
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        BigDecimal revenueThisMonth = orderRepo.sumRevenueByDateRange(startOfMonth, endOfMonth);
        BigDecimal revenueLastMonth = orderRepo.sumRevenueByDateRange(startOfLastMonth, endOfLastMonth);

        double trend = 0;
        if (revenueLastMonth != null && revenueLastMonth.compareTo(BigDecimal.ZERO) > 0 && revenueThisMonth != null) {
            trend = revenueThisMonth.subtract(revenueLastMonth)
                .divide(revenueLastMonth, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        List<SalesDataPoint> salesChart = orderRepo.findDailySalesData(LocalDateTime.now().minusDays(30))
            .stream().map(row -> SalesDataPoint.builder()
                .date(row[0].toString())
                .orders(((Number) row[1]).longValue())
                .revenue(new BigDecimal(row[2].toString())).build())
            .collect(Collectors.toList());

        List<TopProductResponse> topProducts = orderRepo.findTopProducts(5).stream()
            .map(row -> TopProductResponse.builder()
                .name(row[0].toString())
                .totalSold(((Number) row[1]).longValue())
                .totalRevenue(new BigDecimal(row[2].toString())).build())
            .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
            .totalProducts(totalProducts).totalOrders(totalOrders)
            .pendingOrders(pendingOrders).lowStockCount(lowStockCount)
            .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
            .revenueLastMonth(revenueLastMonth != null ? revenueLastMonth : BigDecimal.ZERO)
            .revenueTrend(trend).salesChart(salesChart).topProducts(topProducts).build();
    }
}
