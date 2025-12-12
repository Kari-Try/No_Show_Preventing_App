package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateFaqRequest {
  @NotNull
  private Long venueId;

  @NotBlank
  private String question;

  @NotBlank
  private String answer;

  private Boolean isActive = true;
}
