package com.movieticket.service.impl;

import com.movieticket.dto.request.UserUpdateRequest;
import com.movieticket.dto.response.UserResponse;
import com.movieticket.entity.User;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.UserRepository;
import com.movieticket.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
