package com.movieticket.service;

import com.movieticket.dto.request.PromotionRequest;
import com.movieticket.dto.request.UserRoleRequest;
import com.movieticket.dto.request.UserStatusRequest;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.PromotionResponse;
import com.movieticket.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Map;

public interface AdminService {
    PageResponse<UserResponse> getUsers(String keyword, String role, Boolean isActive, Pageable pageable);
    UserResponse updateUserRole(Long id, UserRoleRequest request);
    void updateUserStatus(Long id, UserStatusRequest request);

    PageResponse<PromotionResponse> getPromotions(Boolean isActive, Pageable pageable);
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Integer id, PromotionRequest request);
    void deletePromotion(Integer id);

    Map<String, Object> getRevenueReport(String type, LocalDate from, LocalDate to);
    Object getTopMovies(LocalDate from, LocalDate to, Integer limit);
    Map<String, Object> getOccupancyReport(LocalDate from, LocalDate to, Integer cinemaId);
}
