package com.inventory.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
public class DashboardStatsResponse {
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;
    private long lowStockCount;
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueLastMonth;
    private double revenueTrend;
    private List<SalesDataPoint> salesChart;
    private List<TopProductResponse> topProducts;

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class SalesDataPoint {
        private String date;
        private long orders;
        private BigDecimal revenue;
    }

    @Getter @Setter @Builder @AllArgsConstructor @NoArgsConstructor
    public static class TopProductResponse {
        private String name;
        private long totalSold;
        private BigDecimal totalRevenue;
    }
}
