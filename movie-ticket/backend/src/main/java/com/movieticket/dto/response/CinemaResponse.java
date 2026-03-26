package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CinemaResponse {
    private Integer id;
    private String name;
    private String address;
    private String phone;
    private boolean isActive;
    private Integer totalRooms;
}
