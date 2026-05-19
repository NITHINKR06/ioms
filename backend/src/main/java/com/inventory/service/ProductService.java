package com.inventory.service;

import com.inventory.dto.request.ProductRequest;
import com.inventory.dto.response.ProductResponse;
import com.inventory.entity.*;
import com.inventory.exception.*;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final SupplierRepository supplierRepo;
    private final UserRepository userRepo;

    public Page<ProductResponse> getAll(String search, Long categoryId, String status, Pageable pageable) {
        Specification<Product> spec = Specification.where(null);
        if (search != null && !search.isBlank()) {
            spec = spec.and((root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                cb.like(cb.lower(root.get("sku")), "%" + search.toLowerCase() + "%")));
        }
        if (categoryId != null) spec = spec.and((root, q, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        if (status != null) spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), ProductStatus.valueOf(status)));
        return productRepo.findAll(spec, pageable).map(this::toResponse);
    }

    public ProductResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public List<ProductResponse> getLowStock() {
        return productRepo.findLowStockProducts().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Category cat = categoryRepo.findById(req.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        String sku = generateSku(cat);
        if (productRepo.existsBySku(sku)) throw new DuplicateResourceException("SKU conflict: " + sku);
        Supplier supplier = req.getSupplierId() != null
            ? supplierRepo.findById(req.getSupplierId()).orElse(null) : null;
        User currentUser = getCurrentUser();
        Product p = Product.builder()
            .sku(sku).name(req.getName()).description(req.getDescription())
            .price(req.getPrice()).costPrice(req.getCostPrice())
            .quantityInStock(req.getQuantityInStock()).reorderLevel(req.getReorderLevel())
            .imageUrl(req.getImageUrl()).status(req.getStatus() != null ? req.getStatus() : ProductStatus.ACTIVE)
            .category(cat).supplier(supplier).createdBy(currentUser).build();
        return toResponse(productRepo.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product p = findOrThrow(id);
        Category cat = categoryRepo.findById(req.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Supplier supplier = req.getSupplierId() != null
            ? supplierRepo.findById(req.getSupplierId()).orElse(null) : null;
        p.setName(req.getName()); p.setDescription(req.getDescription());
        p.setPrice(req.getPrice()); p.setCostPrice(req.getCostPrice());
        p.setQuantityInStock(req.getQuantityInStock()); p.setReorderLevel(req.getReorderLevel());
        p.setImageUrl(req.getImageUrl()); p.setStatus(req.getStatus());
        p.setCategory(cat); p.setSupplier(supplier);
        return toResponse(productRepo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        Product p = findOrThrow(id);
        p.setStatus(ProductStatus.INACTIVE);
        productRepo.save(p);
    }

    private String generateSku(Category cat) {
        String code = cat.getName().substring(0, Math.min(4, cat.getName().length())).toUpperCase();
        String maxSku = productRepo.findMaxSkuByPrefix(code).orElse(null);
        int seq = 1;
        if (maxSku != null) {
            try { seq = Integer.parseInt(maxSku.substring(maxSku.lastIndexOf('-') + 1)) + 1; }
            catch (Exception ignored) {}
        }
        return String.format("PRD-%s-%04d", code, seq);
    }

    private Product findOrThrow(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElse(null);
    }

    public ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
            .id(p.getId()).sku(p.getSku()).name(p.getName()).description(p.getDescription())
            .price(p.getPrice()).costPrice(p.getCostPrice())
            .quantityInStock(p.getQuantityInStock()).reorderLevel(p.getReorderLevel())
            .lowStock(p.getQuantityInStock() <= p.getReorderLevel())
            .imageUrl(p.getImageUrl()).status(p.getStatus())
            .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
            .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
            .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
            .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
            .createdAt(p.getCreatedAt()).updatedAt(p.getUpdatedAt()).build();
    }
}
