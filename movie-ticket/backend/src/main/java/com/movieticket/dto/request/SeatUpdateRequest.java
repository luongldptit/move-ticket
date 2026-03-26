package com.movieticket.dto.request;

import lombok.Data;

@Data
public class SeatUpdateRequest {
    private String type;
    private Boolean isActive;
}
