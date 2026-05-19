package com.inventory.repository;
import com.inventory.entity.Customer;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable p);
    boolean existsByEmail(String email);
}
