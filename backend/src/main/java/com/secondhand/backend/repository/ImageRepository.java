package com.secondhand.backend.repository;

import com.secondhand.backend.entity.Image;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByFromTypeAndFromId(
            String fromType,
            Long fromId
    );

    Optional<Image> findByFromTypeAndFromIdAndIsCoverTrue(
            String fromType,
            Long fromId
    );

}