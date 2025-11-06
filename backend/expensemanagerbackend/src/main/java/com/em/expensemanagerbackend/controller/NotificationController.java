package com.em.expensemanagerbackend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    /**
     * Simple ping endpoint - returns empty notification list since we don't
     * store notifications
     */
    @GetMapping
    public ResponseEntity<List<String>> getAllNotifications() {
        // Return empty list - no stored notifications, just real-time pings
        return ResponseEntity.ok(new ArrayList<>());
    }

    /**
     * Get unread notifications count - always returns 0 since we don't store
     * notifications
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Integer> getUnreadNotificationCount() {
        return ResponseEntity.ok(0);
    }

    /**
     * Test endpoint
     */
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Simple notification ping system is working!");
    }
}
