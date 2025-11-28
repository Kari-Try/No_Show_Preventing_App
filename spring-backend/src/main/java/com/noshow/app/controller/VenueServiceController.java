package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
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
}
