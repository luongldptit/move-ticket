package com.movieticket.service.impl;

import com.movieticket.exception.BusinessException;
import com.movieticket.service.EmailService;
import com.movieticket.utils.ConstantUtils;
import com.movieticket.utils.CurrencyUtils;
import com.movieticket.utils.DateUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public void sendBookingSuccessEmail(
            String toEmail,
            String customerName,
            String movieTitle,
            LocalDateTime startTime,
            String seatCodes,
            BigDecimal amount) {
        log.info("Sending booking confirmation email to: {}", toEmail);
        try {
            List<String> seatList = Arrays.asList(seatCodes.split(", "));

            Context context = new Context();
            context.setVariable(ConstantUtils.CUSTOMER_NAME, customerName);
            context.setVariable(ConstantUtils.MOVIE_TITLE, movieTitle);
            context.setVariable(ConstantUtils.START_TIME, DateUtils.formatDateTime(startTime));
            context.setVariable(ConstantUtils.SEATS, seatList);
            context.setVariable(ConstantUtils.AMOUNT, CurrencyUtils.formatVND(amount));

            String htmlContent = templateEngine.process(ConstantUtils.TEMPLATE_BOOKING_SUCCESS, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(toEmail);
            helper.setSubject(ConstantUtils.SUBJECT);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Booking confirmation email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            throw new BusinessException("Send email failed: " + e.getMessage());
        }
    }
}
