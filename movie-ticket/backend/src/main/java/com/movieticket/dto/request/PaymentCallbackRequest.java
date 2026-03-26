package com.movieticket.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentCallbackRequest {
    private Long paymentId;
    private Long bookingId;
    private String transactionId;
    private String status; // SUCCESS / FAILED
    private BigDecimal amount;
    private String signature;
}
