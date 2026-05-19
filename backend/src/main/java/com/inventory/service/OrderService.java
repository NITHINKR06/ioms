package com.inventory.service;

import com.inventory.dto.request.*;
import com.inventory.dto.response.*;
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
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j @Service @RequiredArgsConstructor
public class OrderService {
    private static final BigDecimal TAX_RATE = new BigDecimal("0.18");
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final StockService stockService;

    public Page<OrderResponse> getAll(String status, Pageable pageable) {
        Specification<Order> spec = Specification.where(null);
        if (status != null && !status.isBlank())
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), OrderStatus.valueOf(status)));
        return orderRepo.findAll(spec, pageable).map(this::toResponse);
    }

    public OrderResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional(rollbackFor = Exception.class)
    public OrderResponse create(OrderRequest req) {
        Customer customer = req.getCustomerId() != null
            ? customerRepo.findById(req.getCustomerId()).orElseThrow(() -> new ResourceNotFoundException("Customer not found"))
            : null;

        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepo.findByIdWithLock(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            if (product.getStatus() != ProductStatus.ACTIVE)
                throw new InsufficientStockException("Product is not active: " + product.getName());
            if (product.getQuantityInStock() < itemReq.getQuantity())
                throw new InsufficientStockException("Insufficient stock for " + product.getName()
                    + ". Available: " + product.getQuantityInStock());
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            items.add(OrderItem.builder()
                .product(product).quantity(itemReq.getQuantity())
                .unitPrice(product.getPrice()).totalPrice(itemTotal).build());
        }

        BigDecimal discount = req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO;
        BigDecimal taxable = subtotal.subtract(discount);
        BigDecimal tax = taxable.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax);

        User creator = getCurrentUser();
        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .customer(customer).status(OrderStatus.PENDING)
            .subtotal(subtotal).discount(discount).tax(tax).totalAmount(total)
            .paymentStatus(PaymentStatus.UNPAID).paymentMethod(req.getPaymentMethod())
            .shippingAddress(req.getShippingAddress()).notes(req.getNotes())
            .createdBy(creator).build();

        Order saved = orderRepo.save(order);
        for (OrderItem item : items) {
            item.setOrder(saved);
            orderItemRepo.save(item);
            // deduct stock
            StockMovementRequest smr = new StockMovementRequest();
            smr.setProductId(item.getProduct().getId());
            smr.setType(MovementType.STOCK_OUT);
            smr.setQuantity(item.getQuantity());
            smr.setReferenceNo(saved.getOrderNumber());
            smr.setNotes("Order: " + saved.getOrderNumber());
            stockService.recordMovement(smr);
        }
        return toResponse(orderRepo.findById(saved.getId()).orElseThrow());
    }

    @Transactional(rollbackFor = Exception.class)
    public OrderResponse updateStatus(Long id, OrderStatusRequest req) {
        Order order = findOrThrow(id);
        validateTransition(order.getStatus(), req.getStatus());

        if (req.getStatus() == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            // restore stock
            for (OrderItem item : order.getOrderItems()) {
                StockMovementRequest smr = new StockMovementRequest();
                smr.setProductId(item.getProduct().getId());
                smr.setType(MovementType.STOCK_IN);
                smr.setQuantity(item.getQuantity());
                smr.setReferenceNo(order.getOrderNumber());
                smr.setNotes("Cancelled order: " + order.getOrderNumber());
                stockService.recordMovement(smr);
            }
        }

        order.setStatus(req.getStatus());
        if (req.getPaymentStatus() != null) order.setPaymentStatus(req.getPaymentStatus());
        return toResponse(orderRepo.save(order));
    }

    @Transactional
    public void delete(Long id) {
        Order order = findOrThrow(id);
        if (order.getStatus() != OrderStatus.CANCELLED) {
            OrderStatusRequest req = new OrderStatusRequest();
            req.setStatus(OrderStatus.CANCELLED);
            updateStatus(id, req);
        }
    }

    private void validateTransition(OrderStatus current, OrderStatus next) {
        Map<OrderStatus, List<OrderStatus>> allowed = Map.of(
            OrderStatus.PENDING,     List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED,   List.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING,  List.of(OrderStatus.SHIPPED),
            OrderStatus.SHIPPED,     List.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED,   List.of(),
            OrderStatus.CANCELLED,   List.of()
        );
        if (!allowed.getOrDefault(current, List.of()).contains(next))
            throw new InvalidOrderStatusException("Cannot transition from " + current + " to " + next);
    }

    private String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "ORD-" + date + "-";
        String max = orderRepo.findMaxOrderNumberByPrefix(prefix).orElse(null);
        int seq = 1;
        if (max != null) {
            try { seq = Integer.parseInt(max.substring(max.lastIndexOf('-') + 1)) + 1; }
            catch (Exception ignored) {}
        }
        return prefix + String.format("%04d", seq);
    }

    private Order findOrThrow(Long id) {
        return orderRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByUsername(username).orElse(null);
    }

    public OrderResponse toResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getOrderItems() == null ? List.of() :
            o.getOrderItems().stream().map(item -> OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice()).build()).collect(Collectors.toList());
        return OrderResponse.builder()
            .id(o.getId()).orderNumber(o.getOrderNumber())
            .customerId(o.getCustomer() != null ? o.getCustomer().getId() : null)
            .customerName(o.getCustomer() != null ? o.getCustomer().getName() : "Walk-in")
            .status(o.getStatus()).subtotal(o.getSubtotal())
            .discount(o.getDiscount()).tax(o.getTax()).totalAmount(o.getTotalAmount())
            .paymentStatus(o.getPaymentStatus()).paymentMethod(o.getPaymentMethod())
            .shippingAddress(o.getShippingAddress()).notes(o.getNotes())
            .orderItems(itemResponses).createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt()).build();
    }
}
