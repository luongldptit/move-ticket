package com.movieticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCallbackRequest {
    @NotNull(message = "ID thanh toán không được để trống")
    private Long paymentId;
    private Long bookingId;
    private String transactionId;
    private String status; // SUCCESS / FAILED
    private BigDecimal amount;
    private String signature;
}
