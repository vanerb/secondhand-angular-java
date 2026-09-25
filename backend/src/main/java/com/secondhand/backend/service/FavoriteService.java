package com.secondhand.backend.service;

import com.secondhand.backend.entity.Favorite;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.FavoriteRepository;
import com.secondhand.backend.repository.ProductRepository;
import com.secondhand.backend.repository.UserRepository;
import com.secondhand.backend.security.JwtService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public void addFavorite(
            String token,
            Long productId
    ) {

        User user = getUserFromToken(token);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        boolean alreadyFavorite =
                favoriteRepository
                        .existsByUserAndProduct(
                                user,
                                product
                        );

        if (alreadyFavorite) {
            return;
        }

        Favorite favorite = new Favorite();

        favorite.setUser(user);
        favorite.setProduct(product);

        favoriteRepository.save(favorite);
    }

    public void removeFavorite(
            String token,
            Long productId
    ) {

        User user = getUserFromToken(token);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        favoriteRepository.deleteByUserAndProduct(
                user,
                product
        );
    }

    public List<Product> getFavorites(
            String token
    ) {

        User user = getUserFromToken(token);

        return favoriteRepository
                .findByUser(user)
                .stream()
                .map(Favorite::getProduct)
                .toList();
    }

    public boolean isFavorite(
            String token,
            Long productId
    ) {

        User user = getUserFromToken(token);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        return favoriteRepository
                .existsByUserAndProduct(
                        user,
                        product
                );
    }

    private User getUserFromToken(
            String token
    ) {

        String email =
                jwtService.extractEmail(token);

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }
}