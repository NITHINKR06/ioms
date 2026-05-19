package com.inventory.controller;
import com.inventory.dto.request.SupplierRequest;
import com.inventory.dto.response.*;
import com.inventory.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/suppliers") @RequiredArgsConstructor
public class SupplierController {
    private final SupplierService service;
    @GetMapping public ResponseEntity<ApiResponse<PagedResponse<SupplierResponse>>> getAll(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) { return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(service.getAll(PageRequest.of(page, size))))); }
    @GetMapping("/{id}") public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @PostMapping public ResponseEntity<ApiResponse<SupplierResponse>> create(@Valid @RequestBody SupplierRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Created", service.create(req))); }
    @PutMapping("/{id}") public ResponseEntity<ApiResponse<SupplierResponse>> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) { return ResponseEntity.ok(ApiResponse.ok("Updated", service.update(id, req))); }
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
}
