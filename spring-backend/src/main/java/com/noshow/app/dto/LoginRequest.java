package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
  @NotBlank
  private String identifier; // email or username or phone

  @NotBlank
  private String password;
}
