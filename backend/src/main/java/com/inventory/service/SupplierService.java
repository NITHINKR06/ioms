package com.inventory.service;

import com.inventory.dto.request.SupplierRequest;
import com.inventory.dto.response.*;
import com.inventory.entity.Supplier;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository repo;

    public Page<SupplierResponse> getAll(Pageable pageable) {
        return repo.findAll(pageable).map(this::toResponse);
    }

    public SupplierResponse getById(Long id) { return toResponse(findOrThrow(id)); }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        Supplier s = Supplier.builder().name(req.getName()).contactPerson(req.getContactPerson())
            .email(req.getEmail()).phone(req.getPhone()).address(req.getAddress())
            .status(req.getStatus()).build();
        return toResponse(repo.save(s));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = findOrThrow(id);
        s.setName(req.getName()); s.setContactPerson(req.getContactPerson());
        s.setEmail(req.getEmail()); s.setPhone(req.getPhone());
        s.setAddress(req.getAddress()); s.setStatus(req.getStatus());
        return toResponse(repo.save(s));
    }

    @Transactional
    public void delete(Long id) { repo.deleteById(id); }

    private Supplier findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder().id(s.getId()).name(s.getName())
            .contactPerson(s.getContactPerson()).email(s.getEmail()).phone(s.getPhone())
            .address(s.getAddress()).status(s.getStatus()).createdAt(s.getCreatedAt()).build();
    }
}
