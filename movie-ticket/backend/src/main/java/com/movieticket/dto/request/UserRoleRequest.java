package com.movieticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRoleRequest {
    @NotBlank(message = "Vai trò không được để trống")
    private String role; // CUSTOMER / STAFF / ADMIN
}
