package com.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String name;
    private String type;
    private Integer totalSeats;
    @JsonProperty("isActive")
    private Boolean isActive;
    private CinemaResponse cinema;
}
