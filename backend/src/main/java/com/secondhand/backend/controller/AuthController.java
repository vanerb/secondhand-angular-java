package com.secondhand.backend.controller;

import com.secondhand.backend.dto.AuthDTO;
import com.secondhand.backend.dto.LoginDTO;
import com.secondhand.backend.entity.User;
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
    public ResponseEntity<AuthDTO> register(
            @RequestParam String name,
            @RequestParam String cogname,
            @RequestParam String type,
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(required = false) MultipartFile image) {
        return ResponseEntity.ok(
                authService.register(
                        name,
                        cogname,
                        type,
                        username,
                        email,
                        password,
                        image));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO> login(
            @RequestBody LoginDTO request) {
        return ResponseEntity.ok(
                authService.login(request));
    }

    @GetMapping("/user")
    public ResponseEntity<User> getUserByToken(
            @RequestHeader("Authorization") String authorization) {

        String token = authorization.substring(7);

        User user = authService.getUserByToken(token);

        return ResponseEntity.ok(user);
    }

}