package com.secondhand.backend.dto;

import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.Condition;

import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {

    private Long id;

    private String name;

    private String category;

    private BigDecimal price;

    private Condition condition;

    private Availability availability;

    private Long userId;

    private String username;

    private List<String> images;

    private boolean favorite;

    public ProductDTO() {
    }

    public ProductDTO(
            Long id,
            String name,
            String category,
            BigDecimal price,
            Condition condition,
            Availability availability,
            Long userId,
            String username,
            List<String> images,
            boolean favorite
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.condition = condition;
        this.availability = availability;
        this.userId = userId;
        this.username = username;
        this.images = images;
        this.favorite = favorite;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Condition getCondition() {
        return condition;
    }

    public Availability getAvailability() {
        return availability;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public List<String> getImages() {
        return images;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCondition(Condition condition) {
        this.condition = condition;
    }

    public void setAvailability(Availability availability) {
        this.availability = availability;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }
}