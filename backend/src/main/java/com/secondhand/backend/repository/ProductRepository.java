package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Product;

import com.secondhand.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ProductRepository
                extends JpaRepository<Product, Long>,
                JpaSpecificationExecutor<Product> {

        List<Product> findByUserId(Long userId);

        List<Product> findByUserUsername(String username);

        List<Product> findByUser(User user);
}