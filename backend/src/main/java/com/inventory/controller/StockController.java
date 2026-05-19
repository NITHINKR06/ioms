package com.inventory.controller;

import com.inventory.dto.request.StockMovementRequest;
import com.inventory.dto.response.*;
import com.inventory.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/stock") @RequiredArgsConstructor
public class StockController {
    private final StockService service;

    @GetMapping("/movements")
    public ResponseEntity<ApiResponse<PagedResponse<StockMovementResponse>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(
            service.getAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))))));
    }

    @GetMapping("/movements/product/{productId}")
    public ResponseEntity<ApiResponse<PagedResponse<StockMovementResponse>>> getByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(
            service.getByProduct(productId, PageRequest.of(page, size)))));
    }

    @PostMapping("/movement")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_MANAGER')")
    public ResponseEntity<ApiResponse<StockMovementResponse>> record(@Valid @RequestBody StockMovementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Stock recorded", service.recordMovement(req)));
    }
}
