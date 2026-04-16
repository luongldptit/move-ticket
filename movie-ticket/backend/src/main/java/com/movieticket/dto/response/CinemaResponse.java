package com.movieticket.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CinemaResponse {
    private Integer id;
    private String name;
    private String address;
    private String phone;
    @JsonProperty("isActive")
    private Boolean isActive;
    private Integer totalRooms;
}
