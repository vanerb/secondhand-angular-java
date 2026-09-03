package com.secondhand.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // Desactivar CSRF porque usamos una API REST
            .csrf(csrf -> csrf.disable())

            // Configuración de autorización
            .authorizeHttpRequests(auth -> auth

                // Login y registro públicos
                .requestMatchers("/api/auth/**").permitAll()

                // Imágenes públicas
                .requestMatchers("/uploads/**").permitAll()

                // Todo lo demás requiere autenticación
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
