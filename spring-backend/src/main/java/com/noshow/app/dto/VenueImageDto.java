package com.noshow.app.dto;

import com.noshow.app.domain.entity.VenueImage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VenueImageDto {
  private Long imageId;
  private Long venueId;
  private String mimeType;
  private LocalDateTime createdAt;

  public static VenueImageDto fromEntity(VenueImage image) {
    return VenueImageDto.builder()
      .imageId(image.getImageId())
      .venueId(image.getVenue() != null ? image.getVenue().getVenueId() : null)
      .mimeType(image.getMimeType())
      .createdAt(image.getCreatedAt())
      .build();
  }
}
