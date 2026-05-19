package com.inventory.controller;
import com.inventory.dto.request.CustomerRequest;
import com.inventory.dto.response.*;
import com.inventory.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/customers") @RequiredArgsConstructor
public class CustomerController {
    private final CustomerService service;
    @GetMapping public ResponseEntity<ApiResponse<PagedResponse<CustomerResponse>>> getAll(@RequestParam(required=false) String search, @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) { return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(service.getAll(search, PageRequest.of(page, size))))); }
    @GetMapping("/{id}") public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @PostMapping public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CustomerRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Created", service.create(req))); }
    @PutMapping("/{id}") public ResponseEntity<ApiResponse<CustomerResponse>> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) { return ResponseEntity.ok(ApiResponse.ok("Updated", service.update(id, req))); }
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
}
