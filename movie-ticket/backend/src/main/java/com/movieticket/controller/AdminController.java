package com.movieticket.controller;

import com.movieticket.dto.request.*;
import com.movieticket.dto.response.*;
import com.movieticket.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ============ USER MANAGEMENT ============

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getUsers(keyword, role, isActive,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id, @Valid @RequestBody UserRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền thành công",
                adminService.updateUserRole(id, request)));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id, @Valid @RequestBody UserStatusRequest request) {
        adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", null));
    }

    // ============ PROMOTION MANAGEMENT ============

    @GetMapping("/promotions")
    public ResponseEntity<ApiResponse<PageResponse<PromotionResponse>>> getPromotions(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.getPromotions(isActive, PageRequest.of(page, size))));
    }

    @PostMapping("/promotions")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
            @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo khuyến mãi thành công", adminService.createPromotion(request)));
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable Integer id, @Valid @RequestBody PromotionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật khuyến mãi thành công",
                adminService.updatePromotion(id, request)));
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Integer id) {
        adminService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công", null));
    }

    // ============ REPORTS ============

    @GetMapping("/reports/revenue")
    public ResponseEntity<ApiResponse<?>> getRevenueReport(
            @RequestParam(defaultValue = "daily") String type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getRevenueReport(type, from, to)));
    }

    @GetMapping("/reports/top-movies")
    public ResponseEntity<ApiResponse<?>> getTopMovies(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTopMovies(from, to, limit)));
    }

    @GetMapping("/reports/occupancy")
    public ResponseEntity<ApiResponse<?>> getOccupancyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer cinemaId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getOccupancyReport(from, to, cinemaId)));
    }
}
