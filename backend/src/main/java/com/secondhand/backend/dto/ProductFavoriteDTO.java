package com.secondhand.backend.dto;

import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.Condition;
import com.secondhand.backend.entity.Image;
import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.User;

import java.math.BigDecimal;
import java.util.List;

public class ProductFavoriteDTO {

    private Long id;
    private String name;
    private String category;
    private BigDecimal price;
    private Condition condition;
    private Availability availability;
    private User user;
    private String description;
    private List<Image> images;

    public ProductFavoriteDTO(Product product, List<Image> images) {
        this.id = product.getId();
        this.name = product.getName();
        this.category = product.getCategory();
        this.price = product.getPrice();
        this.condition = product.getCondition();
        this.availability = product.getAvailability();
        this.user = product.getUser();
        this.description = product.getDescription();
        this.images = images;
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

    public User getUser() {
        return user;
    }

    public String getDescription() {
        return description;
    }

    public List<Image> getImages() {
        return images;
    }
}