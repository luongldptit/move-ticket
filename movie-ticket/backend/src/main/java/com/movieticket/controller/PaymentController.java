package com.movieticket.controller;

import com.movieticket.dto.request.PaymentCallbackRequest;
import com.movieticket.dto.request.PaymentInitiateRequest;
import com.movieticket.dto.response.ApiResponse;
import com.movieticket.dto.response.PaymentResponse;
import com.movieticket.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PaymentInitiateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo thanh toán thành công",
                paymentService.initiatePayment(user.getUsername(), request)));
    }

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<?>> handleCallback(
            @RequestBody PaymentCallbackRequest request) {
        PaymentService.BookingCallbackResponse result = paymentService.handleCallback(request);
        return ResponseEntity.ok(ApiResponse.success("Xử lý thanh toán thành công", result));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBookingId(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getPaymentByBookingId(bookingId, user.getUsername())));
    }
}
