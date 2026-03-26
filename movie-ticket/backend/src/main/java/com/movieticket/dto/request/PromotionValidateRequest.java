package com.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PromotionValidateRequest {
    @NotBlank(message = "Mã khuyến mãi không được để trống")
    private String code;

    @NotNull(message = "Giá trị đơn hàng không được để trống")
    private BigDecimal orderAmount;
}
