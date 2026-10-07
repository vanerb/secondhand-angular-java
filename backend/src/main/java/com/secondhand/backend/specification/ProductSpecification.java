package com.secondhand.backend.specification;

import com.secondhand.backend.entity.Product;
import com.secondhand.backend.entity.Availability;
import com.secondhand.backend.entity.Condition;

import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasName(String name) {

        return (root, query, criteriaBuilder) -> {

            if (name == null || name.isBlank()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Product> hasCategory(
            String category) {

        return (root, query, criteriaBuilder) -> {

            if (category == null || category.isBlank()) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("category"),
                    category);
        };
    }

    public static Specification<Product> hasMinPrice(
            Double minPrice) {

        return (root, query, criteriaBuilder) -> {

            if (minPrice == null) {
                return null;
            }

            return criteriaBuilder.greaterThanOrEqualTo(
                    root.get("price"),
                    minPrice);
        };
    }

    public static Specification<Product> hasMaxPrice(
            Double maxPrice) {

        return (root, query, criteriaBuilder) -> {

            if (maxPrice == null) {
                return null;
            }

            return criteriaBuilder.lessThanOrEqualTo(
                    root.get("price"),
                    maxPrice);
        };
    }

    public static Specification<Product> hasCondition(
            Condition condition) {

        return (root, query, criteriaBuilder) -> {

            if (condition == null) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("condition"),
                    condition);
        };
    }

    public static Specification<Product> hasAvailability(
            Availability availability) {

        return (root, query, criteriaBuilder) -> {

            if (availability == null) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("availability"),
                    availability);
        };
    }

    public static Specification<Product> hasUserId(
            Long userId) {

        return (root, query, criteriaBuilder) -> {

            if (userId == null) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("user").get("id"),
                    userId);
        };
    }

    public static Specification<Product> hasDescription(String description) {

        return (root, query, criteriaBuilder) -> {

            if (description == null || description.isBlank()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")),
                    "%" + description.toLowerCase() + "%");
        };
    }

    public static Specification<Product> isNotArchived() {

        return (root, query, criteriaBuilder) ->

        criteriaBuilder.isFalse(root.get("archived"));

    }
}