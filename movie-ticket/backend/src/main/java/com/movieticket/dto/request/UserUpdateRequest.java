package com.movieticket.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(max = 100)
    private String fullName;

    @Size(max = 15)
    private String phone;
}
