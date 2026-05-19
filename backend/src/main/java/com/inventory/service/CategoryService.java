package com.inventory.service;

import com.inventory.dto.request.CategoryRequest;
import com.inventory.dto.response.CategoryResponse;
import com.inventory.entity.Category;
import com.inventory.exception.*;
import com.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository repo;

    public List<CategoryResponse> getAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public CategoryResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (repo.existsByName(req.getName()))
            throw new DuplicateResourceException("Category already exists: " + req.getName());
        Category c = Category.builder().name(req.getName()).description(req.getDescription()).build();
        return toResponse(repo.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = findOrThrow(id);
        c.setName(req.getName()); c.setDescription(req.getDescription());
        return toResponse(repo.save(c));
    }

    @Transactional
    public void delete(Long id) { repo.deleteById(id); }

    private Category findOrThrow(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder().id(c.getId()).name(c.getName()).description(c.getDescription())
            .productCount(c.getProducts() != null ? c.getProducts().size() : 0).build();
    }
}
