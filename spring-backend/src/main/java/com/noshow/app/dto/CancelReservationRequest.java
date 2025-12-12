package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelReservationRequest {
  @NotBlank
  private String cancelReason;
}
