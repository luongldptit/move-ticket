package com.movieticket.service.impl;

import com.movieticket.exception.BusinessException;
import com.movieticket.service.EmailService;
import com.movieticket.utils.ConstantUtils;
import com.movieticket.utils.CurrencyUtils;
import com.movieticket.utils.DateUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Override
    public void sendBookingSuccessEmail(
            String toEmail,
            String customerName,
            String movieTitle,
            LocalDateTime startTime,
            String seatCodes,
            BigDecimal amount) {
        log.info("Sending mail to: {}", toEmail);
        try {
            // Build HTML content
            Context context = new Context();
            context.setVariable(ConstantUtils.CUSTOMER_NAME, customerName);
            context.setVariable(ConstantUtils.MOVIE_TITLE, movieTitle);
            context.setVariable(ConstantUtils.START_TIME, DateUtils.formatDateTime(startTime));
            context.setVariable(ConstantUtils.SEATS, seatCodes);
            context.setVariable(ConstantUtils.AMOUNT, CurrencyUtils.formatVND(amount.doubleValue()));

            String htmlContent = templateEngine.process(ConstantUtils.TEMPLATE_BOOKING_SUCCESS, context);

            //  Create mail
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(""); // hardCode email của mình để gửi or email admin
            helper.setTo(toEmail);
            helper.setSubject(ConstantUtils.SUBJECT);
            helper.setText(htmlContent, true);

            // Send
            mailSender.send(message);
            log.info("mail sent successfully");

        } catch (Exception e) {
            // todo: customer throw error code + message
            throw new BusinessException("Send email failed: " + e.getMessage());
        }
    }
}
