package com.movieticket.service;

import com.movieticket.dto.request.UserUpdateRequest;
import com.movieticket.dto.response.UserResponse;

public interface UserService {
    UserResponse getMyProfile(String email);
    UserResponse updateMyProfile(String email, UserUpdateRequest request);
}
