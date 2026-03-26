package com.movieticket.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SeatBatchRequest {
    @NotNull(message = "ID phòng không được để trống")
    private Integer roomId;

    @NotNull
    @Valid
    private List<SeatRowConfig> rows;

    @Data
    public static class SeatRowConfig {
        private String rowLabel;
        private Integer seatCount;
        private String type = "STANDARD";
    }
}
