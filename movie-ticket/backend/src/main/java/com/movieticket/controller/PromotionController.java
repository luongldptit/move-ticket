package com.movieticket.controller;

import com.movieticket.dto.request.PromotionValidateRequest;
import com.movieticket.dto.response.ApiResponse;
import com.movieticket.dto.response.PromotionResponse;
import com.movieticket.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<PromotionResponse>> validatePromotion(
            @Valid @RequestBody PromotionValidateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Mã khuyến mãi hợp lệ",
                promotionService.validatePromotion(request)));
    }
}
