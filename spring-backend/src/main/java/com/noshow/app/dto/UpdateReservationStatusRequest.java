package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateReservationStatusRequest {
  @NotBlank
  private String action; // "NO_SHOW", "CANCEL", "COMPLETE"

  private String reason; // optional for cancel/notes
}
