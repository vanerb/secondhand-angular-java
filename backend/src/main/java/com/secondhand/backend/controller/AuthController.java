package com.secondhand.backend.controller;

import com.secondhand.backend.dto.AuthResponse;
import com.secondhand.backend.dto.LoginRequest;
import com.secondhand.backend.dto.RegisterRequest;
import com.secondhand.backend.service.AuthService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> register(
        @RequestParam String name,
        @RequestParam String cogname,
        @RequestParam String type,
        @RequestParam String username,
        @RequestParam String email,
        @RequestParam String password,
        @RequestParam(required = false) MultipartFile image
) {
    return ResponseEntity.ok(
        authService.register(
            name,
            cogname,
            type,
            username,
            email,
            password,
            image
        )
    );
}

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}