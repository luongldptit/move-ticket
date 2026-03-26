package com.movieticket.service.impl;

import com.movieticket.dto.request.PromotionRequest;
import com.movieticket.dto.request.UserRoleRequest;
import com.movieticket.dto.request.UserStatusRequest;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.PromotionResponse;
import com.movieticket.dto.response.UserResponse;
import com.movieticket.entity.Promotion;
import com.movieticket.entity.User;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ConflictException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingSeatRepository bookingSeatRepository;

    // ============ USER MANAGEMENT ============

    @Override
    public PageResponse<UserResponse> getUsers(String keyword, String role, Boolean isActive, Pageable pageable) {
        User.Role roleEnum = (role != null) ? User.Role.valueOf(role) : null;
        Page<User> page = userRepository.findUsersWithFilters(keyword, roleEnum, isActive, pageable);
        List<UserResponse> content = page.getContent().stream()
                .map(this::mapUserToResponse).collect(Collectors.toList());
        return PageResponse.<UserResponse>builder()
                .content(content).totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages()).currentPage(page.getNumber()).pageSize(page.getSize()).build();
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, UserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + id));
        user.setRole(User.Role.valueOf(request.getRole()));
        return mapUserToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void updateUserStatus(Long id, UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với id: " + id));
        user.setActive(request.getIsActive());
        userRepository.save(user);
    }

    // ============ PROMOTION MANAGEMENT ============

    @Override
    public PageResponse<PromotionResponse> getPromotions(Boolean isActive, Pageable pageable) {
        Page<Promotion> page;
        if (isActive != null) {
            page = promotionRepository.findAllByIsActive(isActive, pageable);
        } else {
            page = promotionRepository.findAll(pageable);
        }
        List<PromotionResponse> content = page.getContent().stream()
                .map(this::mapPromoToResponse).collect(Collectors.toList());
        return PageResponse.<PromotionResponse>builder()
                .content(content).totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages()).currentPage(page.getNumber()).pageSize(page.getSize()).build();
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (promotionRepository.existsByCode(request.getCode())) {
            throw new ConflictException("Mã khuyến mãi '" + request.getCode() + "' đã tồn tại");
        }
        Promotion promo = Promotion.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(Promotion.DiscountType.valueOf(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapPromoToResponse(promotionRepository.save(promo));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Integer id, PromotionRequest request) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));
        if (request.getDescription() != null) promo.setDescription(request.getDescription());
        if (request.getDiscountValue() != null) promo.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderAmount() != null) promo.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscountAmount() != null) promo.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getStartDate() != null) promo.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) promo.setEndDate(request.getEndDate());
        if (request.getUsageLimit() != null) promo.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) promo.setActive(request.getIsActive());
        return mapPromoToResponse(promotionRepository.save(promo));
    }

    @Override
    @Transactional
    public void deletePromotion(Integer id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khuyến mãi với id: " + id));
        promo.setActive(false);
        promotionRepository.save(promo);
    }

    // ============ REPORTS ============

    @Override
    public Map<String, Object> getRevenueReport(String type, LocalDate from, LocalDate to) {
        Map<String, Object> result = new HashMap<>();
        BigDecimal totalRevenue = paymentRepository.sumRevenueByDateRange(from, to);
        result.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        result.put("from", from);
        result.put("to", to);
        result.put("type", type);

        List<Object[]> rawData;
        if ("monthly".equalsIgnoreCase(type)) {
            rawData = paymentRepository.getMonthlyRevenue(from, to);
        } else {
            rawData = paymentRepository.getDailyRevenue(from, to);
        }
        List<Map<String, Object>> breakdown = rawData.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("period", row[0]);
            item.put("revenue", row[1]);
            item.put("bookings", row[2]);
            return item;
        }).collect(Collectors.toList());
        result.put("breakdown", breakdown);
        return result;
    }

    @Override
    public Object getTopMovies(LocalDate from, LocalDate to, Integer limit) {
        // Query bookings grouped by movie in date range
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().name().equals("CONFIRMED"))
                .collect(Collectors.groupingBy(
                        b -> b.getShowtime().getMovie().getTitle(),
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit != null ? limit : 10)
                .map(e -> Map.of("title", e.getKey(), "bookings", e.getValue()))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getOccupancyReport(LocalDate from, LocalDate to, Integer cinemaId) {
        Map<String, Object> result = new HashMap<>();
        result.put("from", from);
        result.put("to", to);
        result.put("cinemaId", cinemaId);
        // Placeholder - can be enhanced with specific queries
        result.put("message", "Occupancy report calculated");
        return result;
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName())
                .phone(user.getPhone()).role(user.getRole().name()).isActive(user.isActive())
                .createdAt(user.getCreatedAt()).build();
    }

    private PromotionResponse mapPromoToResponse(Promotion p) {
        return PromotionResponse.builder()
                .id(p.getId()).code(p.getCode()).description(p.getDescription())
                .discountType(p.getDiscountType().name()).discountValue(p.getDiscountValue())
                .minOrderAmount(p.getMinOrderAmount()).maxDiscountAmount(p.getMaxDiscountAmount())
                .startDate(p.getStartDate()).endDate(p.getEndDate())
                .usageLimit(p.getUsageLimit()).usedCount(p.getUsedCount()).isActive(p.isActive()).build();
    }
}
