package com.inventory.controller;
import com.inventory.dto.response.*;
import com.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/dashboard") @RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(service.getStats()));
    }
}
