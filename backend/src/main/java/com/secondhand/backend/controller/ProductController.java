package com.secondhand.backend.controller;

import com.secondhand.backend.dto.ProductDTO;
import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.Condition;
import com.secondhand.backend.service.ProductService;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductController {

        private final ProductService productService;

        public ProductController(
                        ProductService productService) {
                this.productService = productService;
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ProductDTO> createProduct(

                        @RequestHeader("Authorization") String authorization,

                        @RequestParam String name,
                        @RequestParam String category,
                        @RequestParam BigDecimal price,
                        @RequestParam Condition condition,
                        @RequestParam(required = false) Availability availability,
                        @RequestParam(required = false) List<MultipartFile> images,
                        @RequestParam String description

        ) throws IOException {

                String token = authorization.substring(7);

                return ResponseEntity.ok(
                                productService.createProduct(
                                                token,
                                                name,
                                                category,
                                                price,
                                                condition,
                                                availability,
                                                images,
                                                description));
        }

        // =========================================================
        // PRODUCTOS PÚBLICOS - SIN TOKEN
        // GET /api/products
        // =========================================================

        @GetMapping
        public ResponseEntity<Page<ProductDTO>> getProducts(

                        @RequestParam(required = false) String name,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) Double minPrice,
                        @RequestParam(required = false) Double maxPrice,
                        @RequestParam(required = false) Condition condition,
                        @RequestParam(required = false) Availability availability,
                        @RequestParam(required = false) Long userId,
                        @RequestParam(required = false) String description,
                        Pageable pageable

        ) {

                return ResponseEntity.ok(
                                productService.getProducts(
                                                null,
                                                name,
                                                category,
                                                minPrice,
                                                maxPrice,
                                                condition,
                                                availability,
                                                userId,
                                                pageable,
                                                description));
        }

        // =========================================================
        // PRODUCTOS AUTENTICADOS - CON TOKEN
        // GET /api/products/auth
        // =========================================================

        @GetMapping("/auth")
        public ResponseEntity<Page<ProductDTO>> getProductsAuthenticated(

                        @RequestHeader("Authorization") String authorization,

                        @RequestParam(required = false) String name,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) Double minPrice,
                        @RequestParam(required = false) Double maxPrice,
                        @RequestParam(required = false) Condition condition,
                        @RequestParam(required = false) Availability availability,
                        @RequestParam(required = false) Long userId,
                        @RequestParam(required = false) String description,
                        Pageable pageable

        ) {

                String token = authorization.substring(7);

                return ResponseEntity.ok(
                                productService.getProducts(
                                                token,
                                                name,
                                                category,
                                                minPrice,
                                                maxPrice,
                                                condition,
                                                availability,
                                                userId,
                                                pageable,
                                                description));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ProductDTO> getProductById(

                        @RequestHeader("Authorization") String authorization,

                        @PathVariable Long id

        ) {

                String token = authorization.substring(7);

                return ResponseEntity.ok(
                                productService.getProductById(
                                                token,
                                                id));
        }

        @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ProductDTO> updateProduct(

                        @RequestHeader("Authorization") String authorization,

                        @PathVariable Long id,

                        @RequestParam String name,
                        @RequestParam String category,
                        @RequestParam BigDecimal price,
                        @RequestParam Condition condition,
                        @RequestParam Availability availability,

                        // Imágenes nuevas
                        @RequestParam(required = false) List<MultipartFile> images,

                        // Imágenes antiguas que se mantienen
                        @RequestParam(required = false) List<String> existingImages,

                        @RequestParam String description

        ) throws IOException {

                String token = authorization.substring(7);

                return ResponseEntity.ok(
                                productService.updateProduct(
                                                token,
                                                id,
                                                name,
                                                category,
                                                price,
                                                condition,
                                                availability,
                                                images,
                                                existingImages,
                                                description));
        }

        @DeleteMapping("/{id}")
        @Transactional 
        public ResponseEntity<Void> deleteProduct(

                        @RequestHeader("Authorization") String authorization,

                        @PathVariable Long id

        ) {

                String token = authorization.substring(7);

                productService.deleteProduct(
                                token,
                                id);

                return ResponseEntity.noContent().build();
        }
}