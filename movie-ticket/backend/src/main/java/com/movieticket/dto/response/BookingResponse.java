package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private String movieTitle;
    private String posterUrl;
    private LocalDateTime startTime;
    private String cinemaName;
    private String roomName;
    private List<String> seatCodes;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
    private String promotionApplied;
}
