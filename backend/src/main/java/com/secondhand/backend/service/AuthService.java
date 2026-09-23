package com.secondhand.backend.service;

import com.secondhand.backend.dto.AuthDTO;
import com.secondhand.backend.dto.LoginDTO;
import com.secondhand.backend.entity.Image;
import com.secondhand.backend.entity.User;
import com.secondhand.backend.repository.UserRepository;
import com.secondhand.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ImageService imageService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ImageService imageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.imageService = imageService;
    }

    public AuthDTO register(
            String name,
            String cogname,
            String type,
            String username,
            String email,
            String password,
            MultipartFile image) {

        // Comprobar si el email ya existe
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Comprobar si el username ya existe
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("El usuario ya existe");
        }

        // Crear usuario
        User user = new User();

        user.setName(name);
        user.setCogname(cogname);
        if (type == null || type.isEmpty()) {
            user.setType("USER");
        } else {
            user.setType(type);
        }
        user.setUsername(username);
        user.setEmail(email);

        // Encriptar contraseña
        user.setPassword(
                passwordEncoder.encode(password));

        // Guardar usuario para obtener el ID
        userRepository.save(user);

        // Si se ha enviado una imagen, guardarla
        if (image != null && !image.isEmpty()) {

            try {

                Image savedImage = imageService.upload(
                        image,
                        "USER",
                        user.getId(),
                        true);

                // Guardamos también la URL en User
                user.setProfileImage(
                        savedImage.getUrl());

                userRepository.save(user);

            } catch (Exception e) {

                throw new RuntimeException(
                        "No se pudo guardar la imagen de perfil",
                        e);
            }
        }

        // Generar JWT
        String token = jwtService.generateToken(
                user.getEmail());

        return new AuthDTO(token);
    }

    public AuthDTO login(LoginDTO request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            throw new RuntimeException(
                    "Email o contraseña incorrectos");
        }

        String token = jwtService.generateToken(
                user.getEmail());

        return new AuthDTO(token);
    }

    public User getUserByToken(String token) {

        String email = jwtService.extractEmail(token);

        return userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));
    }
}