package com.secondhand.backend.dto;

public class AuthDTO {
    private String token;

    public AuthDTO(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}
