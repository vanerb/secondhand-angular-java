package com.secondhand.backend.interfaces;

import com.secondhand.backend.entity.Image;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ImageInterface {

    Image upload(
            MultipartFile file,
            String fromType,
            Long fromId,
            boolean isCover) throws IOException;

    List<Image> getImages(
            String fromType,
            Long fromId);

    Image getCoverImage(
            String fromType,
            Long fromId);

    void delete(Long id);

    void deleteByFromId(
            String fromType,
            Long fromId);
}