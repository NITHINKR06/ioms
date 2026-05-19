package com.inventory.repository;
import com.inventory.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
    void deleteByUser(User user);
}
