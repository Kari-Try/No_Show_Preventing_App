package com.noshow.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVenueRequest {
  @NotBlank
  private String venueName;

  private String description;

  private BigDecimal basePrice;

  @NotNull
  @Min(0)
  @Max(100)
  private Double defaultDepositRatePercent;

  private String address;
  private String addressDetail;
}
