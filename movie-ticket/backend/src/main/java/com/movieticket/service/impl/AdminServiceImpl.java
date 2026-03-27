package com.movieticket.service.impl;

import com.movieticket.dto.request.CreateUserRequest;
import com.movieticket.dto.request.PromotionRequest;
import com.movieticket.dto.request.UserRoleRequest;
import com.movieticket.dto.request.UserStatusRequest;
import com.movieticket.dto.response.PageResponse;
import com.movieticket.dto.response.PromotionResponse;
import com.movieticket.dto.response.UserResponse;
import com.movieticket.entity.Booking;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final ShowtimeRepository showtimeRepository;
    private final PasswordEncoder passwordEncoder;

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
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã được sử dụng");
        }
        User.Role role = User.Role.CUSTOMER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            role = User.Role.valueOf(request.getRole());
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .build();
        return mapUserToResponse(userRepository.save(user));
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

        long totalBookings = bookingRepository.countConfirmedByDateRange(from, to);
        result.put("totalBookings", totalBookings);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Object getTopMovies(LocalDate from, LocalDate to, Integer limit) {
        // Lọc booking CONFIRMED trong khoảng ngày
        var grouped = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED)
                .filter(b -> {
                    LocalDate d = b.getCreatedAt().toLocalDate();
                    return (from == null || !d.isBefore(from)) && (to == null || !d.isAfter(to));
                })
                .collect(Collectors.groupingBy(b -> b.getShowtime().getMovie()));

        // Sắp xếp theo tổng doanh thu giảm dần
        var sorted = grouped.entrySet().stream()
                .sorted((a, b) -> {
                    BigDecimal ra = a.getValue().stream()
                            .map(bk -> bk.getFinalAmount() != null ? bk.getFinalAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal rb = b.getValue().stream()
                            .map(bk -> bk.getFinalAmount() != null ? bk.getFinalAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return rb.compareTo(ra);
                })
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            var entry = sorted.get(i);
            var movie = entry.getKey();
            var bookings = entry.getValue();

            BigDecimal totalRevenue = bookings.stream()
                    .map(b -> b.getFinalAmount() != null ? b.getFinalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long totalShowtimes = bookings.stream()
                    .map(b -> b.getShowtime().getId()).distinct().count();
            // Đếm tổng số ghế (vé) thực tế
            long totalTicketsSold = bookings.stream()
                    .mapToLong(b -> bookingSeatRepository.findByBookingId(b.getId()).size())
                    .sum();

            Map<String, Object> row = new HashMap<>();
            row.put("rank", i + 1);
            row.put("movieId", movie.getId());
            row.put("movieTitle", movie.getTitle());
            row.put("posterUrl", movie.getPosterUrl());
            row.put("totalTicketsSold", totalTicketsSold);
            row.put("totalShowtimes", totalShowtimes);
            row.put("totalRevenue", totalRevenue);
            result.add(row);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOccupancyReport(LocalDate from, LocalDate to, Integer cinemaId) {
        List<Showtime> showtimes = showtimeRepository.findByDateRangeAndCinema(from, to, cinemaId);

        if (showtimes.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("averageOccupancyRate", 0.0);
            result.put("totalShowtimes", 0);
            result.put("from", from);
            result.put("to", to);
            return result;
        }

        double totalRate = 0.0;
        int counted = 0;
        for (Showtime st : showtimes) {
            int totalSeats = st.getRoom().getTotalSeats();
            if (totalSeats <= 0) continue;
            long bookedSeats = bookingRepository.countActiveByShowtimeId(st.getId());
            totalRate += (bookedSeats * 100.0 / totalSeats);
            counted++;
        }

        double averageOccupancyRate = counted > 0 ? totalRate / counted : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("averageOccupancyRate", Math.round(averageOccupancyRate * 10.0) / 10.0);
        result.put("totalShowtimes", showtimes.size());
        result.put("from", from);
        result.put("to", to);
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
