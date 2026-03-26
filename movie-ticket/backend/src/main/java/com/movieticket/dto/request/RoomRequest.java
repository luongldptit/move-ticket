package com.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {
    @NotNull(message = "ID rạp phim không được để trống")
    private Integer cinemaId;

    @NotBlank(message = "Tên phòng không được để trống")
    private String name;

    private String type = "2D";
    private Integer totalSeats = 0;
    private Boolean isActive = true;
}
