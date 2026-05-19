package com.inventory.service;

import com.inventory.dto.request.StockMovementRequest;
import com.inventory.dto.response.StockMovementResponse;
import com.inventory.entity.*;
import com.inventory.exception.*;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j @Service @RequiredArgsConstructor
public class StockService {
    private final ProductRepository productRepo;
    private final StockMovementRepository movementRepo;
    private final UserRepository userRepo;

    @Transactional(rollbackFor = Exception.class)
    public StockMovementResponse recordMovement(StockMovementRequest req) {
        Product product = productRepo.findByIdWithLock(req.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));

        int before = product.getQuantityInStock();
        int after;

        switch (req.getType()) {
            case STOCK_IN, RETURN -> after = before + req.getQuantity();
            case STOCK_OUT -> {
                if (before < req.getQuantity())
                    throw new InsufficientStockException(
                        "Insufficient stock for " + product.getName() + ". Available: " + before + ", Requested: " + req.getQuantity());
                after = before - req.getQuantity();
            }
            case ADJUSTMENT -> after = req.getQuantity(); // absolute set
            default -> throw new IllegalArgumentException("Unknown movement type");
        }

        product.setQuantityInStock(after);
        productRepo.save(product);

        User user = getCurrentUser();
        StockMovement movement = StockMovement.builder()
            .product(product).type(req.getType()).quantity(req.getQuantity())
            .quantityBefore(before).quantityAfter(after)
            .referenceNo(req.getReferenceNo()).notes(req.getNotes())
            .createdBy(user).build();
        return toResponse(movementRepo.save(movement));
    }

    public Page<StockMovementResponse> getAll(Pageable pageable) {
        return movementRepo.findAll(pageable).map(this::toResponse);
    }

    public Page<StockMovementResponse> getByProduct(Long productId, Pageable pageable) {
        return movementRepo.findByProductIdOrderByCreatedAtDesc(productId, pageable).map(this::toResponse);
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElse(null);
    }

    public StockMovementResponse toResponse(StockMovement m) {
        return StockMovementResponse.builder()
            .id(m.getId())
            .productId(m.getProduct().getId())
            .productName(m.getProduct().getName())
            .productSku(m.getProduct().getSku())
            .type(m.getType()).quantity(m.getQuantity())
            .quantityBefore(m.getQuantityBefore()).quantityAfter(m.getQuantityAfter())
            .referenceNo(m.getReferenceNo()).notes(m.getNotes())
            .createdBy(m.getCreatedBy() != null ? m.getCreatedBy().getUsername() : "system")
            .createdAt(m.getCreatedAt()).build();
    }
}
