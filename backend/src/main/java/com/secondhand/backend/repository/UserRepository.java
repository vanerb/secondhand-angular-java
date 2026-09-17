package com.secondhand.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.secondhand.backend.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
