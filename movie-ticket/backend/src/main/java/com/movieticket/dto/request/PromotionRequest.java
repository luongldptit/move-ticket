package com.movieticket.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PromotionRequest {
    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(max = 50)
    private String code;

    @Size(max = 255)
    private String description;

    @NotBlank(message = "Loại giảm giá không được để trống")
    private String discountType; // PERCENTAGE / FIXED

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    private Boolean isActive = true;
}
