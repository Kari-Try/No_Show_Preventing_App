package com.noshow.app.dto;

import com.noshow.app.domain.entity.Venue;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class VenueDto {
  private Long venueId;
  private String venueName;
  private String description;
  private BigDecimal basePrice;
  private Double defaultDepositRatePercent;
  private String address;
  private Boolean isActive;
  private String ownerUserId;
  private List<VenueServiceDto> services;

  public static VenueDto fromEntity(Venue venue, boolean includeServices) {
    String address = "";
    if (venue.getAddressLine1() != null) {
      address = venue.getAddressLine1();
    }
    if (venue.getAddressLine2() != null && !venue.getAddressLine2().isBlank()) {
      address = address.isBlank() ? venue.getAddressLine2() : address + " " + venue.getAddressLine2();
    }

    List<VenueServiceDto> serviceDtos = null;
    if (includeServices && venue.getServices() != null) {
      serviceDtos = venue.getServices()
        .stream()
        .map(VenueServiceDto::fromEntity)
        .collect(Collectors.toList());
    }

    return VenueDto.builder()
      .venueId(venue.getVenueId())
      .venueName(venue.getVenueName())
      .description(venue.getDescription())
      .basePrice(venue.getBasePrice())
      .defaultDepositRatePercent(venue.getDefaultDepositRatePercent())
      .address(address.isBlank() ? null : address)
      .isActive(venue.getIsActive())
      .ownerUserId(venue.getOwner() != null ? venue.getOwner().getUserId() : null)
      .services(serviceDtos)
      .build();
  }
}
