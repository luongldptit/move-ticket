package com.movieticket.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShowtimeRequest {
    @NotNull(message = "ID phim không được để trống")
    private Long movieId;

    @NotNull(message = "ID phòng không được để trống")
    private Integer roomId;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Giá vé thường không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá vé phải lớn hơn 0")
    private BigDecimal priceStandard;

    @NotNull(message = "Giá vé VIP không được để trống")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal priceVip;

    @NotNull(message = "Giá vé Couple không được để trống")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal priceCouple;

    private String status;
}
