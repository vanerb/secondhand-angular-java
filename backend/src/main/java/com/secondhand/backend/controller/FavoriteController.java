package com.secondhand.backend.controller;

import com.secondhand.backend.entity.Product;
import com.secondhand.backend.service.FavoriteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:4200")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(
            FavoriteService favoriteService
    ) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> addFavorite(

            @RequestHeader("Authorization")
            String authorization,

            @PathVariable Long productId

    ) {

        String token =
                authorization.substring(7);

        favoriteService.addFavorite(
                token,
                productId
        );

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(

            @RequestHeader("Authorization")
            String authorization,

            @PathVariable Long productId

    ) {

        String token =
                authorization.substring(7);

        favoriteService.removeFavorite(
                token,
                productId
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Product>> getFavorites(

            @RequestHeader("Authorization")
            String authorization

    ) {

        String token =
                authorization.substring(7);

        return ResponseEntity.ok(
                favoriteService.getFavorites(token)
        );
    }

    @GetMapping("/{productId}/exists")
    public ResponseEntity<Boolean> isFavorite(

            @RequestHeader("Authorization")
            String authorization,

            @PathVariable Long productId

    ) {

        String token =
                authorization.substring(7);

        return ResponseEntity.ok(
                favoriteService.isFavorite(
                        token,
                        productId
                )
        );
    }
}