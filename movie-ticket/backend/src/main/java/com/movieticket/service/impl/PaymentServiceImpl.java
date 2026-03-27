package com.movieticket.service.impl;

import com.movieticket.dto.request.PaymentCallbackRequest;
import com.movieticket.dto.request.PaymentInitiateRequest;
import com.movieticket.dto.response.PaymentResponse;
import com.movieticket.entity.*;
import com.movieticket.exception.BusinessException;
import com.movieticket.exception.ResourceNotFoundException;
import com.movieticket.repository.*;
import com.movieticket.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public PaymentResponse initiatePayment(String email, PaymentInitiateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (!booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền thanh toán booking này");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("Booking không ở trạng thái có thể thanh toán");
        }

        // Reuse existing payment if already created (retry scenario)
        Optional<Payment> existing = paymentRepository.findByBookingId(booking.getId());
        Payment payment;
        if (existing.isPresent()) {
            payment = existing.get();
            if (payment.getStatus() == Payment.Status.SUCCESS) {
                throw new BusinessException("Booking đã được thanh toán thành công");
            }
            payment.setMethod(Payment.Method.valueOf(request.getMethod()));
            payment.setAmount(booking.getFinalAmount());
            payment.setStatus(Payment.Status.PENDING);
            payment.setTransactionId(null);
            payment.setPaidAt(null);
        } else {
            payment = Payment.builder()
                    .booking(booking)
                    .method(Payment.Method.valueOf(request.getMethod()))
                    .amount(booking.getFinalAmount())
                    .status(Payment.Status.PENDING)
                    .build();
        }
        payment = paymentRepository.save(payment);

        String paymentUrl = "https://payment.example.com/pay?paymentId=" + payment.getId()
                + "&amount=" + payment.getAmount();
        return mapToResponse(payment, paymentUrl);
    }

    @Override
    @Transactional
    public PaymentService.BookingCallbackResponse handleCallback(PaymentCallbackRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment"));
        Booking booking = payment.getBooking();

        if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
            payment.setStatus(Payment.Status.SUCCESS);
            payment.setTransactionId(request.getTransactionId());
            payment.setPaidAt(LocalDateTime.now());
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setQrCode("QR-" + booking.getBookingCode() + "-" + System.currentTimeMillis());
        } else {
            payment.setStatus(Payment.Status.FAILED);
            booking.setStatus(Booking.BookingStatus.EXPIRED);
        }
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return new PaymentService.BookingCallbackResponse(
                booking.getBookingCode(),
                booking.getStatus().name(),
                booking.getQrCode()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking"));
        if (!booking.getUser().getEmail().equals(email)) {
            throw new BusinessException("Bạn không có quyền truy cập thông tin này");
        }
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có thông tin thanh toán"));
        return mapToResponse(payment, null);
    }

    private PaymentResponse mapToResponse(Payment payment, String paymentUrl) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .bookingCode(payment.getBooking().getBookingCode())
                .method(payment.getMethod().name())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .paymentUrl(paymentUrl)
                .build();
    }
}
