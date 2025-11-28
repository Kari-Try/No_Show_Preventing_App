package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAvailabilityBlockRequest {
  @NotNull
  private String blockDate; // yyyy-MM-dd

  @NotNull
  private String startTime; // HH:mm

  @NotNull
  private String endTime;   // HH:mm

  private String reason;
}
