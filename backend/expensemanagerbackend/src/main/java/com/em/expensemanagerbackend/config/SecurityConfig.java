package com.em.expensemanagerbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for development (enable in production with proper configuration)
                .csrf(csrf -> csrf.disable())
                // Configure CORS
                .cors(cors -> cors.configurationSource(request -> {
            var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
            corsConfiguration.setAllowedOriginPatterns(java.util.List.of("*"));
            corsConfiguration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            corsConfiguration.setAllowedHeaders(java.util.List.of("*"));
            corsConfiguration.setAllowCredentials(true);
            return corsConfiguration;
        }))
                // Configure authorization
                .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/assets/**", "/api/health", "/api/test").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
                )
                // Configure headers
                .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())
                .contentTypeOptions(contentTypeOptions -> {
                })
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                .maxAgeInSeconds(31536000)
                .includeSubDomains(true)
                .preload(true)
                )
                .referrerPolicy(referrerPolicy
                        -> referrerPolicy.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                );

        return http.build();
    }
}
