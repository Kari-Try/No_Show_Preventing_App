package com.noshow.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
  @Email
  private String email; // optional

  @NotBlank
  @Size(min = 4, max = 30, message = "Username must be 4-30 characters")
  private String username;

  @NotBlank
  @Size(min = 8, message = "Password must be at least 8 characters")
  private String password;

  @NotBlank
  private String name;

  @NotBlank
  @Pattern(regexp = "^010-\\d{4}-\\d{4}$", message = "Phone must match 010-0000-0000")
  private String phone;

  @NotBlank
  private String userType; // customer | owner
}
