package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ShowtimeResponse {
    private Long id;
    private MovieResponse movie;
    private RoomResponse room;
    private CinemaResponse cinema;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal priceStandard;
    private BigDecimal priceVip;
    private BigDecimal priceCouple;
    private String status;
    private Integer availableSeats;
    private Integer totalSeats;
}
