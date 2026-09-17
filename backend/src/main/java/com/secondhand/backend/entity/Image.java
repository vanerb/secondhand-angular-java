package com.secondhand.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String url;       // URL o path de la imagen
    private String fromType;  // "USER", "PRODUCT", etc.
    private Long fromId;      // ID del usuario, producto, etc.

    private Boolean isCover = false; // Indica si es la imagen principal
}