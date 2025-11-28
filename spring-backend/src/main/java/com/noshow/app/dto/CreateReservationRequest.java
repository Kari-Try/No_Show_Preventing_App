package com.noshow.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReservationRequest {
  @NotNull
  private Long serviceId;

  @NotNull
  private String scheduledStart; // ISO string

  @Min(1)
  private Integer partySize = 1;
}
