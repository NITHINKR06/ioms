package com.inventory.service;

import com.inventory.dto.request.CustomerRequest;
import com.inventory.dto.response.*;
import com.inventory.entity.Customer;
import com.inventory.exception.*;
import com.inventory.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository repo;

    public Page<CustomerResponse> getAll(String search, Pageable pageable) {
        if (search != null && !search.isBlank())
            return repo.findByNameContainingIgnoreCase(search, pageable).map(this::toResponse);
        return repo.findAll(pageable).map(this::toResponse);
    }

    public CustomerResponse getById(Long id) { return toResponse(findOrThrow(id)); }

    @Transactional
    public CustomerResponse create(CustomerRequest req) {
        if (req.getEmail() != null && repo.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Email already exists: " + req.getEmail());
        Customer c = Customer.builder().name(req.getName()).email(req.getEmail())
            .phone(req.getPhone()).address(req.getAddress()).type(req.getType()).build();
        return toResponse(repo.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = findOrThrow(id);
        c.setName(req.getName()); c.setEmail(req.getEmail());
        c.setPhone(req.getPhone()); c.setAddress(req.getAddress()); c.setType(req.getType());
        return toResponse(repo.save(c));
    }

    @Transactional
    public void delete(Long id) { repo.deleteById(id); }

    private Customer findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder().id(c.getId()).name(c.getName()).email(c.getEmail())
            .phone(c.getPhone()).address(c.getAddress()).type(c.getType()).createdAt(c.getCreatedAt()).build();
    }
}
