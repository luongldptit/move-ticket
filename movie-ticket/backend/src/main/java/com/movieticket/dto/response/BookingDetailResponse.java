package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingDetailResponse {
    private Long id;
    private String bookingCode;
    private String qrCode;
    private UserResponse user;
    private ShowtimeInfo showtime;
    private List<SeatInfo> seats;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;
    private PaymentInfo payment;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class ShowtimeInfo {
        private Long id;
        private String movieTitle;
        private LocalDateTime startTime;
        private String roomName;
        private String cinemaName;
    }

    @Data
    @Builder
    public static class SeatInfo {
        private String seatCode;
        private String type;
        private BigDecimal price;
    }

    @Data
    @Builder
    public static class PaymentInfo {
        private String method;
        private String status;
        private LocalDateTime paidAt;
    }
}
