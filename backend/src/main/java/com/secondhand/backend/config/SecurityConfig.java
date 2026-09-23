package com.secondhand.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.secondhand.backend.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // CORS
            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            // API REST: desactivar CSRF
            .csrf(csrf -> csrf.disable())

            // JWT: no usar sesiones
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Autorización
            .authorizeHttpRequests(auth -> auth

                // Preflight de CORS
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // LOGIN Y REGISTRO PÚBLICOS
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // Imágenes públicas
                .requestMatchers(
                    "/uploads/**"
                ).permitAll()

                // WEBSOCKET / SOCKJS
                .requestMatchers(
                    "/ws/**"
                ).permitAll()

                // Resto protegido
                .anyRequest().authenticated()
            )

            // JWT
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
            new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }
}