package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PromotionResponse {
    private Integer id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    // For validate response
    private Boolean isValid;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
