package com.movieticket.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SeatMapResponse {
    private Integer roomId;
    private String roomName;
    private String config;
    private List<SeatRowResponse> rows;

    @Data
    @Builder
    public static class SeatRowResponse {
        private String rowLabel;
        private List<SeatResponse> seats;
    }
}
