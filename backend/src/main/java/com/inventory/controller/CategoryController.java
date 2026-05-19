package com.inventory.controller;
import com.inventory.dto.request.CategoryRequest;
import com.inventory.dto.response.*;
import com.inventory.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/categories") @RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;
    @GetMapping public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() { return ResponseEntity.ok(ApiResponse.ok(service.getAll())); }
    @GetMapping("/{id}") public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.ok(service.getById(id))); }
    @PostMapping public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Created", service.create(req))); }
    @PutMapping("/{id}") public ResponseEntity<ApiResponse<CategoryResponse>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) { return ResponseEntity.ok(ApiResponse.ok("Updated", service.update(id, req))); }
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.ok(ApiResponse.ok("Deleted", null)); }
}
