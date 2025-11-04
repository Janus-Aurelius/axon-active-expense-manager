package com.em.expensemanagerbackend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080"})
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Expense Manager Backend is running");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "API is working correctly");
        response.put("backend", "Spring Boot");
        response.put("database", "PostgreSQL");
        return ResponseEntity.ok(response);
    }
}
