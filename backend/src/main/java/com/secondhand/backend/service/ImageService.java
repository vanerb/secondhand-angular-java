package com.secondhand.backend.service;

import com.secondhand.backend.entity.Image;
import com.secondhand.backend.repository.ImageRepository;
import com.secondhand.backend.interfaces.ImageInterface;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ImageService implements ImageInterface {

    private final ImageRepository repository;

    // Carpeta uploads en la raíz del backend
    private final String uploadDir =
            System.getProperty("user.dir") + File.separator + "uploads";

    public ImageService(ImageRepository repository) {
        this.repository = repository;
    }

    @Override
    public Image upload(
            MultipartFile file,
            String fromType,
            Long fromId,
            boolean isCover
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "No se recibió ningún archivo"
            );
        }

        // uploads/user/1/
        Path folder = Paths.get(
                uploadDir,
                fromType.toLowerCase(),
                String.valueOf(fromId)
        );

        // Crear la carpeta si no existe
        Files.createDirectories(folder);

        // Nombre original
        String originalFileName = file.getOriginalFilename();

        // Nombre final
        String safeFileName =
                System.currentTimeMillis()
                + "_"
                + originalFileName;

        // Ruta completa
        Path destination =
                folder.resolve(safeFileName);

        // Guardar archivo
        file.transferTo(destination.toFile());

        // Crear registro en BD
        Image image = new Image();

        image.setUrl(
                "/uploads/"
                + fromType.toLowerCase()
                + "/"
                + fromId
                + "/"
                + safeFileName
        );

        image.setFromType(fromType);
        image.setFromId(fromId);
        image.setIsCover(isCover);

        return repository.save(image);
    }

    @Override
    public Image getCoverImage(
            String fromType,
            Long fromId
    ) {
        return repository
                .findByFromTypeAndFromIdAndIsCoverTrue(
                        fromType,
                        fromId
                )
                .orElse(null);
    }

    @Override
    public List<Image> getImages(
            String fromType,
            Long fromId
    ) {
        return repository.findByFromTypeAndFromId(
                fromType,
                fromId
        );
    }

    @Override
    public void delete(Long id) {

        Image image = repository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No se encontró la imagen con ID: " + id
                        )
                );

        deleteFile(image);

        repository.delete(image);
    }

    @Override
    public void deleteByFromId(
            String fromType,
            Long fromId
    ) {

        List<Image> images =
                repository.findByFromTypeAndFromId(
                        fromType,
                        fromId
                );

        for (Image image : images) {
            deleteFile(image);
            repository.delete(image);
        }
    }

    private void deleteFile(Image image) {

        try {

            String relativePath =
                    image.getUrl()
                            .replaceFirst(
                                    "^/uploads/?",
                                    ""
                            );

            Path filePath =
                    Paths.get(uploadDir)
                            .resolve(relativePath)
                            .normalize();

            Files.deleteIfExists(filePath);

        } catch (IOException e) {

            throw new RuntimeException(
                    "No se pudo borrar el archivo: "
                    + image.getUrl(),
                    e
            );
        }
    }
}