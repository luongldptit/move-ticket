package com.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentInitiateRequest {
    @NotNull(message = "ID đặt vé không được để trống")
    private Long bookingId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String method; // VNPAY / MOMO / BANK_TRANSFER
}
