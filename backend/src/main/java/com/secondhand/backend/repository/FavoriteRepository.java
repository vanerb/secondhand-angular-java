package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Favorite;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository
        extends JpaRepository<Favorite, Long> {

    Optional<Favorite> findByUserAndProduct(
            User user,
            Product product
    );

    boolean existsByUserAndProduct(
            User user,
            Product product
    );

    List<Favorite> findByUser(User user);

    void deleteByUserAndProduct(
            User user,
            Product product
    );

    void deleteByProduct(Product product);
}