package com.movieticket.service;

import com.movieticket.dto.request.ChangePasswordRequest;
import com.movieticket.dto.request.LoginRequest;
import com.movieticket.dto.request.RegisterRequest;
import com.movieticket.dto.response.AuthResponse;
import com.movieticket.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    void changePassword(String email, ChangePasswordRequest request);
}
