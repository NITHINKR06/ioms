package com.inventory.service;

import com.inventory.dto.request.LoginRequest;
import com.inventory.dto.request.RegisterRequest;
import com.inventory.dto.response.AuthResponse;
import com.inventory.dto.response.UserResponse;
import com.inventory.entity.*;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.TokenRefreshException;
import com.inventory.repository.*;
import com.inventory.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = userRepo.findByUsernameOrEmail(req.getUsername(), req.getUsername())
            .orElseThrow();
        List<String> roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
        String accessToken = tokenProvider.generateAccessToken(user.getUsername(), roles);
        return AuthResponse.builder().accessToken(accessToken).tokenType("Bearer")
            .user(toUserResponse(user)).build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new DuplicateResourceException("Username already taken: " + req.getUsername());
        if (userRepo.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Email already registered: " + req.getEmail());
        Role staffRole = roleRepo.findByName(RoleName.ROLE_STAFF).orElseThrow();
        User user = User.builder()
            .username(req.getUsername()).email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .fullName(req.getFullName()).enabled(true)
            .roles(new HashSet<>(Set.of(staffRole))).build();
        user = userRepo.save(user);
        List<String> roles = List.of(RoleName.ROLE_STAFF.name());
        String token = tokenProvider.generateAccessToken(user.getUsername(), roles);
        return AuthResponse.builder().accessToken(token).tokenType("Bearer")
            .user(toUserResponse(user)).build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder().id(user.getId()).username(user.getUsername())
            .email(user.getEmail()).fullName(user.getFullName()).enabled(user.isEnabled())
            .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())).build();
    }
}
