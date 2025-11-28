package com.noshow.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVenueServiceRequest {
  @NotNull
  private Long venueId;

  @NotBlank
  private String serviceName;

  private String description;

  @NotNull
  private BigDecimal price;

  @NotNull
  @Min(1)
  private Integer durationMinutes;

  @NotNull
  @Min(1)
  private Integer minPartySize;

  @NotNull
  @Min(1)
  private Integer maxPartySize;

  @Min(0)
  @Max(100)
  private Double depositRatePercent; // nullable -> venue default when null
}
