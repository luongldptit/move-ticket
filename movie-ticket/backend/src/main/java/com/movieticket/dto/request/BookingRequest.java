package com.movieticket.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {
    @NotNull(message = "ID suất chiếu không được để trống")
    private Long showtimeId;

    @NotEmpty(message = "Danh sách ghế không được để trống")
    @Size(max = 8, message = "Chỉ được chọn tối đa 8 ghế")
    private List<Long> seatIds;

    private String promotionCode;
}
