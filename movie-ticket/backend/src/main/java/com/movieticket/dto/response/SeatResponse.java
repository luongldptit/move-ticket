package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SeatResponse {
    private Long id;
    private String seatCode;
    private String type;
    private boolean isActive;
    private String seatStatus; // AVAILABLE, BOOKED, HELD — only for showtime seat map
    private BigDecimal price;  // only for showtime seat map
}
