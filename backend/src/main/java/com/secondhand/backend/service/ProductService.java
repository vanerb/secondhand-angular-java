package com.secondhand.backend.service;

import com.secondhand.backend.dto.ProductDTO;
import com.secondhand.backend.entity.Image;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.Condition;
import com.secondhand.backend.repository.FavoriteRepository;
import com.secondhand.backend.repository.ProductRepository;
import com.secondhand.backend.repository.UserRepository;
import com.secondhand.backend.security.JwtService;
import com.secondhand.backend.specification.ProductSpecification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final ImageService imageService;
    private final JwtService jwtService;

    public ProductService(
            ProductRepository productRepository,
            UserRepository userRepository,
            FavoriteRepository favoriteRepository,
            ImageService imageService,
            JwtService jwtService
    ) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.favoriteRepository = favoriteRepository;
        this.imageService = imageService;
        this.jwtService = jwtService;
    }

    public ProductDTO createProduct(
            String token,
            String name,
            String category,
            BigDecimal price,
            Condition condition,
            Availability availability,
            List<MultipartFile> images
    ) throws IOException {

        User user = getUserFromToken(token);

        Product product = new Product();

        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setCondition(condition);

        if (availability == null) {
            product.setAvailability(
                    Availability.AVAILABLE
            );
        } else {
            product.setAvailability(availability);
        }

        product.setUser(user);

        product = productRepository.save(product);

        if (images != null && !images.isEmpty()) {

            boolean firstImage = true;

            for (MultipartFile image : images) {

                if (image != null && !image.isEmpty()) {

                    imageService.upload(
                            image,
                            "PRODUCT",
                            product.getId(),
                            firstImage
                    );

                    firstImage = false;
                }
            }
        }

        return convertToDTO(product, user);
    }

    public Page<ProductDTO> getProducts(
            String token,
            String name,
            String category,
            Double minPrice,
            Double maxPrice,
            Condition condition,
            Availability availability,
            Long userId,
            Pageable pageable
    ) {

        User currentUser = getUserFromToken(token);

        Specification<Product> specification =
                Specification.where(
                        ProductSpecification.hasName(name)
                )
                .and(
                        ProductSpecification.hasCategory(category)
                )
                .and(
                        ProductSpecification.hasMinPrice(minPrice)
                )
                .and(
                        ProductSpecification.hasMaxPrice(maxPrice)
                )
                .and(
                        ProductSpecification.hasCondition(condition)
                )
                .and(
                        ProductSpecification.hasAvailability(availability)
                )
                .and(
                        ProductSpecification.hasUserId(userId)
                );

        return productRepository
                .findAll(specification, pageable)
                .map(product ->
                        convertToDTO(product, currentUser)
                );
    }

    public ProductDTO getProductById(
            String token,
            Long productId
    ) {

        User currentUser = getUserFromToken(token);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        return convertToDTO(
                product,
                currentUser
        );
    }

    public ProductDTO updateProduct(
            String token,
            Long productId,
            String name,
            String category,
            BigDecimal price,
            Condition condition,
            Availability availability,
            List<MultipartFile> images
    ) throws IOException {

        User user = getUserFromToken(token);

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Product not found"
                        )
                );

        checkOwnership(product, user);

        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setCondition(condition);
        product.setAvailability(availability);

        productRepository.save(product);

        /*
         * If new images were sent, replace the old ones.
         */
        if (images != null && !images.isEmpty()) {

            imageService.deleteByFromId(
                    "PRODUCT",
                    product.getId()
            );

            boolean firstImage = true;

            for (MultipartFile image : images) {

                if (image != null && !image.isEmpty()) {

                    imageService.upload(
                            image,
                            "PRODUCT",
                            product.getId(),
                            firstImage
                    );

                    firstImage = false;
                }
            }
        }

        return convertToDTO(
                product,
                user
        );
    }

    public void deleteProduct(
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

        checkOwnership(product, user);

        favoriteRepository.deleteByProduct(product);

        imageService.deleteByFromId(
                "PRODUCT",
                product.getId()
        );

        productRepository.delete(product);
    }

    private User getUserFromToken(String token) {

        String email = jwtService.extractEmail(token);

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }

    private void checkOwnership(
            Product product,
            User user
    ) {

        if (!product.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You do not have permission to modify this product"
            );
        }
    }

    private ProductDTO convertToDTO(
            Product product,
            User currentUser
    ) {

        List<Image> productImages =
                imageService.getImages(
                        "PRODUCT",
                        product.getId()
                );

        List<String> imageUrls =
                productImages.stream()
                        .map(Image::getUrl)
                        .toList();

        boolean favorite =
                favoriteRepository.existsByUserAndProduct(
                        currentUser,
                        product
                );

        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getCondition(),
                product.getAvailability(),
                product.getUser().getId(),
                product.getUser().getUsername(),
                imageUrls,
                favorite
        );
    }
}