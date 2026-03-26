package com.movieticket.service;

import com.movieticket.dto.request.PromotionValidateRequest;
import com.movieticket.dto.response.PromotionResponse;

public interface PromotionService {
    PromotionResponse validatePromotion(PromotionValidateRequest request);
}
