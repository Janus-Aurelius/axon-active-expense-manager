package com.em.expensemanagerbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.em.expensemanagerbackend.dto.LoginRequest;
import com.em.expensemanagerbackend.dto.LoginResponse;
import com.em.expensemanagerbackend.model.User;
import com.em.expensemanagerbackend.repository.UserRepository;
import com.em.expensemanagerbackend.utils.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String jwt = jwtUtil.generateJwtToken(user.getEmail());

        return new LoginResponse(jwt, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
