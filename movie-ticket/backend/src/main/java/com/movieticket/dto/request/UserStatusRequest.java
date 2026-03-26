package com.movieticket.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusRequest {
    @NotNull(message = "Trạng thái tài khoản không được để trống")
    private Boolean isActive;
}
