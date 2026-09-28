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
                        JwtService jwtService) {
                this.productRepository = productRepository;
                this.userRepository = userRepository;
                this.favoriteRepository = favoriteRepository;
                this.imageService = imageService;
                this.jwtService = jwtService;
        }

        // =========================================================
        // CREAR PRODUCTO
        // =========================================================

        public ProductDTO createProduct(
                        String token,
                        String name,
                        String category,
                        BigDecimal price,
                        Condition condition,
                        Availability availability,
                        List<MultipartFile> images,
                        String description) throws IOException {

                User user = getUserFromToken(token);

                Product product = new Product();

                product.setName(name);
                product.setCategory(category);
                product.setPrice(price);
                product.setCondition(condition);
                product.setDescription(description);

                if (availability == null) {
                        product.setAvailability(
                                        Availability.AVAILABLE);
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
                                                        firstImage);

                                        firstImage = false;
                                }
                        }
                }

                return convertToDTO(product, user);
        }

        // =========================================================
        // OBTENER PRODUCTOS
        //
        // Puede utilizarse:
        //
        // 1. Sin token -> usuario visitante
        // 2. Con token -> usuario logueado
        // =========================================================

        public Page<ProductDTO> getProducts(
                        String token,
                        String name,
                        String category,
                        Double minPrice,
                        Double maxPrice,
                        Condition condition,
                        Availability availability,
                        Long userId,
                        Pageable pageable,
                        String description) {

                User currentUser = getOptionalUserFromToken(token);

                Specification<Product> specification = Specification.where(
                                ProductSpecification.hasName(name))
                                .and(
                                                ProductSpecification.hasCategory(category))
                                .and(
                                                ProductSpecification.hasMinPrice(minPrice))
                                .and(
                                                ProductSpecification.hasMaxPrice(maxPrice))
                                .and(
                                                ProductSpecification.hasCondition(condition))
                                .and(
                                                ProductSpecification.hasAvailability(availability))
                                .and(
                                                ProductSpecification.hasUserId(userId))
                                .and(
                                                ProductSpecification.hasDescription(description));

                User finalCurrentUser = currentUser;

                return productRepository
                                .findAll(specification, pageable)
                                .map(product -> convertToDTO(
                                                product,
                                                finalCurrentUser));
        }

        // =========================================================
        // OBTENER PRODUCTO POR ID
        //
        // También puede utilizarse sin token.
        // =========================================================

        public ProductDTO getProductById(
                        String token,
                        Long productId) {

                User currentUser = getOptionalUserFromToken(token);

                Product product = productRepository
                                .findById(productId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Product not found"));

                return convertToDTO(
                                product,
                                currentUser);
        }

        // =========================================================
        // ACTUALIZAR PRODUCTO
        // =========================================================
        public ProductDTO updateProduct(
                        String token,
                        Long productId,
                        String name,
                        String category,
                        BigDecimal price,
                        Condition condition,
                        Availability availability,
                        List<MultipartFile> images,
                        List<String> existingImages,
                        String description) throws IOException {

                User user = getUserFromToken(token);

                Product product = productRepository
                                .findById(productId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Product not found"));

                checkOwnership(product, user);

                // =========================================================
                // ACTUALIZAR DATOS DEL PRODUCTO
                // =========================================================

                product.setName(name);
                product.setCategory(category);
                product.setPrice(price);
                product.setCondition(condition);
                product.setAvailability(availability);
                product.setDescription(description);

                productRepository.save(product);

                // =========================================================
                // ACTUALIZAR IMÁGENES
                // =========================================================

                List<Image> currentImages = imageService.getImages(
                                "PRODUCT",
                                product.getId());

                /*
                 * Si no se recibe existingImages significa que
                 * no se quiere conservar ninguna imagen antigua.
                 */
                List<String> imagesToKeep = existingImages != null
                                ? existingImages
                                : List.of();

                // =========================================================
                // ELIMINAR IMÁGENES ANTIGUAS QUE YA NO EXISTEN
                // =========================================================

                for (Image image : currentImages) {

                        if (!imagesToKeep.contains(image.getUrl())) {

                                imageService.delete(image.getId());
                        }
                }

                // =========================================================
                // AÑADIR IMÁGENES NUEVAS
                // =========================================================

                if (images != null && !images.isEmpty()) {

                        /*
                         * Comprobamos si ya existen imágenes.
                         * Si no existe ninguna, la primera nueva será la portada.
                         */
                        boolean hasCover = imageService
                                        .getCoverImage(
                                                        "PRODUCT",
                                                        product.getId()) != null;

                        for (MultipartFile image : images) {

                                if (image != null && !image.isEmpty()) {

                                        imageService.upload(
                                                        image,
                                                        "PRODUCT",
                                                        product.getId(),
                                                        !hasCover);

                                        hasCover = true;
                                }
                        }
                }

                return convertToDTO(
                                product,
                                user);
        }
        // =========================================================
        // ELIMINAR PRODUCTO
        // =========================================================

        public void deleteProduct(
                        String token,
                        Long productId) {

                User user = getUserFromToken(token);

                Product product = productRepository
                                .findById(productId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Product not found"));

                checkOwnership(product, user);

                favoriteRepository.deleteByProduct(product);

                imageService.deleteByFromId(
                                "PRODUCT",
                                product.getId());

                productRepository.delete(product);
        }

        // =========================================================
        // OBTENER USUARIO DESDE TOKEN
        //
        // Este método es obligatorio para operaciones
        // que requieren autenticación.
        // =========================================================

        private User getUserFromToken(String token) {

                if (token == null || token.isBlank()) {
                        throw new RuntimeException(
                                        "Authentication required");
                }

                String email = jwtService.extractEmail(token);

                return userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found"));
        }

        // =========================================================
        // OBTENER USUARIO OPCIONAL
        //
        // Para GET públicos.
        //
        // Sin token -> null
        // Con token -> User
        // =========================================================

        private User getOptionalUserFromToken(String token) {

                if (token == null || token.isBlank()) {
                        return null;
                }

                try {

                        String email = jwtService.extractEmail(token);

                        return userRepository
                                        .findByEmail(email)
                                        .orElse(null);

                } catch (Exception e) {

                        return null;
                }
        }

        // =========================================================
        // COMPROBAR PROPIETARIO
        // =========================================================

        private void checkOwnership(
                        Product product,
                        User user) {

                if (!product.getUser().getId().equals(user.getId())) {

                        throw new RuntimeException(
                                        "You do not have permission to modify this product");
                }
        }

        // =========================================================
        // CONVERTIR PRODUCT -> DTO
        // =========================================================

        private ProductDTO convertToDTO(
                        Product product,
                        User currentUser) {

                List<Image> productImages = imageService.getImages(
                                "PRODUCT",
                                product.getId());

                List<String> imageUrls = productImages.stream()
                                .map(Image::getUrl)
                                .toList();

                boolean favorite = false;

                /*
                 * Si hay usuario logueado comprobamos
                 * si el producto está en favoritos.
                 *
                 * Si es visitante:
                 * favorite = false
                 */
                if (currentUser != null) {

                        favorite = favoriteRepository.existsByUserAndProduct(
                                        currentUser,
                                        product);
                }

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
                                favorite,
                                product.getDescription());
        }

        // =========================================================
        // OBTENER PRODUCTOS POR ID DE USUARIO
        // =========================================================

        public List<ProductDTO> getProductsByUserId(
                        String token,
                        Long userId) {

                User currentUser = getOptionalUserFromToken(token);

                return productRepository
                                .findByUserId(userId)
                                .stream()
                                .map(product -> convertToDTO(
                                                product,
                                                currentUser))
                                .toList();
        }

        // =========================================================
        // OBTENER PRODUCTOS POR USERNAME
        // =========================================================

        public List<ProductDTO> getProductsByUsername(
                        String token,
                        String username) {

                User currentUser = getOptionalUserFromToken(token);

                return productRepository
                                .findByUserUsername(username)
                                .stream()
                                .map(product -> convertToDTO(
                                                product,
                                                currentUser))
                                .toList();
        }

        // =========================================================
        // OBTENER MIS PRODUCTOS MEDIANTE TOKEN
        // =========================================================

        public List<ProductDTO> getMyProducts(
                        String token) {

                User currentUser = getUserFromToken(token);

                return productRepository
                                .findByUser(currentUser)
                                .stream()
                                .map(product -> convertToDTO(
                                                product,
                                                currentUser))
                                .toList();
        }
}