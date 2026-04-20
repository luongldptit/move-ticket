package com.movieticket.dto.request;

import lombok.Data;

@Data
public class SeatBatchUpdateRequest {
    private Long id;
    private Double offsetX;
    private Double offsetY;
    private Double offsetZ;
    private String type;
    private Boolean isActive;
}
