package com.em.expensemanagerbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ping")
public class PingController {

    @GetMapping("/test")
    public ResponseEntity<String> testPing() {
        return ResponseEntity.ok("Ping controller working!");
    }
}
