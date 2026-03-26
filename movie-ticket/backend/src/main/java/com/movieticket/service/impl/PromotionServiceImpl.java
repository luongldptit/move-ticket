package com.movieticket.service.impl;

import com.movieticket.dto.request.PromotionValidateRequest;
import com.movieticket.dto.response.PromotionResponse;
import com.movieticket.entity.Promotion;
import com.movieticket.exception.BusinessException;
import com.movieticket.repository.PromotionRepository;
import com.movieticket.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    public PromotionResponse validatePromotion(PromotionValidateRequest request) {
        Promotion promo = promotionRepository.findByCodeAndIsActiveTrue(request.getCode())
                .orElseThrow(() -> new BusinessException("Mã khuyến mãi không hợp lệ hoặc hết hạn"));

        LocalDate today = LocalDate.now();
        if (promo.getStartDate() != null && today.isBefore(promo.getStartDate())) {
            throw new BusinessException("Mã khuyến mãi chưa đến ngày có hiệu lực");
        }
        if (promo.getEndDate() != null && today.isAfter(promo.getEndDate())) {
            throw new BusinessException("Mã khuyến mãi đã hết hạn");
        }
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new BusinessException("Mã khuyến mãi đã hết lượt sử dụng");
        }

        BigDecimal orderAmount = request.getOrderAmount();
        if (promo.getMinOrderAmount() != null && orderAmount.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new BusinessException("Đơn hàng chưa đủ điều kiện áp dụng mã này (tối thiểu "
                    + promo.getMinOrderAmount() + " VND)");
        }

        BigDecimal discount;
        if (promo.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(promo.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (promo.getMaxDiscountAmount() != null && discount.compareTo(promo.getMaxDiscountAmount()) > 0) {
                discount = promo.getMaxDiscountAmount();
            }
        } else {
            discount = promo.getDiscountValue();
        }
        discount = discount.min(orderAmount);

        return PromotionResponse.builder()
                .id(promo.getId())
                .code(promo.getCode())
                .description(promo.getDescription())
                .discountType(promo.getDiscountType().name())
                .discountValue(promo.getDiscountValue())
                .isValid(true)
                .discountAmount(discount)
                .finalAmount(orderAmount.subtract(discount))
                .build();
    }
}
