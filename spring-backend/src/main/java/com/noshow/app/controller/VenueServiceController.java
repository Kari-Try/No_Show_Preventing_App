package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.AvailabilityBlock;
import com.noshow.app.domain.entity.BusinessHour;
import com.noshow.app.dto.VenueServiceDto;
import com.noshow.app.service.VenueAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class VenueServiceController {
  private final VenueAppService venueAppService;

  @GetMapping("/venue/{venueId}")
  public ApiResponse<List<VenueServiceDto>> servicesByVenue(@PathVariable Long venueId) {
    return ApiResponse.ok(venueAppService.servicesByVenue(venueId));
  }

  @GetMapping("/venue/{venueId}/business-hours")
  public ApiResponse<List<BusinessHour>> businessHours(@PathVariable Long venueId) {
    return ApiResponse.ok(venueAppService.businessHours(venueId));
  }

  @GetMapping("/venue/{venueId}/blocks")
  public ApiResponse<List<AvailabilityBlock>> blocks(@PathVariable Long venueId) {
    return ApiResponse.ok(venueAppService.blocks(venueId));
  }
}
