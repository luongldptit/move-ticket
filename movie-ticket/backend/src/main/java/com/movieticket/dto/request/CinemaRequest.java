package com.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CinemaRequest {
    @NotBlank(message = "Tên rạp không được để trống")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    @Size(max = 15)
    private String phone;

    private Boolean isActive = true;
}
