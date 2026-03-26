package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String name;
    private String type;
    private Integer totalSeats;
    private boolean isActive;
    private CinemaResponse cinema;
}
