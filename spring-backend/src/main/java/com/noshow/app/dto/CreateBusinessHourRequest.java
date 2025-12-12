package com.noshow.app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBusinessHourRequest {
  @NotNull
  private Integer dayOfWeek; // 0-6

  @NotNull
  private String openTime; // HH:mm

  @NotNull
  private String closeTime; // HH:mm
}
