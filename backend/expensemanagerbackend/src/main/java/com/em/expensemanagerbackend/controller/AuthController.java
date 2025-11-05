package com.em.expensemanagerbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.em.expensemanagerbackend.dto.LoginRequest;
import com.em.expensemanagerbackend.dto.LoginResponse;
import com.em.expensemanagerbackend.dto.MessageResponse;
import com.em.expensemanagerbackend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(loginResponse);
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Invalid email or password!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Authentication failed!"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
        // In a stateless JWT implementation, logout is typically handled client-side
        // by removing the token from client storage. 
        // Here we can optionally implement token blacklisting if needed.

        return ResponseEntity.ok(new MessageResponse("Logout successful!"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(HttpServletRequest request) {
        // This endpoint can be used to verify if the current token is valid
        // If the request reaches here, it means the token was valid (handled by security filter)

        return ResponseEntity.ok(new MessageResponse("Token is valid!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        // Get current authenticated user from security context
        try {
            org.springframework.security.core.Authentication authentication
                    = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof com.em.expensemanagerbackend.model.User) {
                com.em.expensemanagerbackend.model.User user = (com.em.expensemanagerbackend.model.User) authentication.getPrincipal();

                // Return user info without password
                LoginResponse userInfo = new LoginResponse(null, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
                return ResponseEntity.ok(userInfo);
            }

            // DEVELOPMENT MODE: Return default user when no authentication
            LoginResponse defaultUser = new LoginResponse(null, 1L, "John Smith (Dev Mode)", "john.smith@company.com", com.em.expensemanagerbackend.enums.UserRole.EMPLOYEE);
            return ResponseEntity.ok(defaultUser);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user information"));
        }
    }
}
