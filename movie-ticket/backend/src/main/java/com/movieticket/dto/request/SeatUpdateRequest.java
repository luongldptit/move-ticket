package com.movieticket.dto.request;

import lombok.Data;

@Data
public class SeatUpdateRequest {
    private String type;
    private Boolean isActive;
    private Double offsetX;
    private Double offsetY;
    private Double offsetZ;
}
