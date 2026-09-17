package com.secondhand.backend.controller;

import com.secondhand.backend.entity.Image;
import com.secondhand.backend.service.ImageService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public Image uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam String fromType,
            @RequestParam Long fromId,
            @RequestParam(defaultValue = "false") boolean isCover
    ) throws IOException {

        return imageService.upload(
                file,
                fromType,
                fromId,
                isCover
        );
    }

    @GetMapping("/{fromType}/{fromId}")
    public List<Image> getImages(
            @PathVariable String fromType,
            @PathVariable Long fromId
    ) {

        return imageService.getImages(
                fromType,
                fromId
        );
    }
}