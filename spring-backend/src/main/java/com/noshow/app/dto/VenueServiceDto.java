package com.noshow.app.dto;

import com.noshow.app.domain.entity.VenueService;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VenueServiceDto {
  private Long serviceId;
  private String serviceName;
  private String description;
  private BigDecimal price;
  private Integer durationMinutes;
  private Integer minPartySize;
  private Integer maxPartySize;
  private Double depositRatePercent;
  private Boolean isActive;

  public static VenueServiceDto fromEntity(VenueService service) {
    return VenueServiceDto.builder()
      .serviceId(service.getServiceId())
      .serviceName(service.getServiceName())
      .description(service.getDescription())
      .price(service.getPrice())
      .durationMinutes(service.getDurationMinutes())
      .minPartySize(service.getMinPartySize())
      .maxPartySize(service.getMaxPartySize())
      .depositRatePercent(service.getDepositRatePercent())
      .isActive(service.getIsActive())
      .build();
  }
}
