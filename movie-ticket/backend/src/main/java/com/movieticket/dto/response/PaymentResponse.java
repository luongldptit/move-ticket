package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private String method;
    private BigDecimal amount;
    private String status;
    private String transactionId;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String paymentUrl;
    private LocalDateTime expiredAt;
}
