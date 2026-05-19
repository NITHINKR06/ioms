package com.inventory.security;
import com.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsernameOrEmail(username, username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        var authorities = user.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority(r.getName().name()))
            .collect(Collectors.toList());
        return new User(user.getUsername(), user.getPassword(),
            user.isEnabled(), true, true, true, authorities);
    }
}
