package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.VenueService;
import com.noshow.app.domain.entity.BusinessHour;
import com.noshow.app.domain.entity.AvailabilityBlock;
import com.noshow.app.dto.CreateAvailabilityBlockRequest;
import com.noshow.app.dto.CreateBusinessHourRequest;
import com.noshow.app.dto.CreateVenueServiceRequest;
import com.noshow.app.dto.VenueServiceDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.VenueAppService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class VenueManagementController {
  private final VenueAppService venueAppService;
  private final AuthService authService;

  @PostMapping("/services")
  public ApiResponse<VenueServiceDto> createService(@Valid @RequestBody CreateVenueServiceRequest request,
                                                    HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    VenueService service = venueAppService.createService(request, owner);
    return ApiResponse.ok(VenueServiceDto.fromEntity(service));
  }

  @PutMapping("/services/{serviceId}")
  public ApiResponse<VenueServiceDto> updateService(@PathVariable Long serviceId,
                                                    @Valid @RequestBody CreateVenueServiceRequest request,
                                                    HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    VenueService service = venueAppService.updateService(serviceId, request, owner);
    return ApiResponse.ok(VenueServiceDto.fromEntity(service));
  }

  @DeleteMapping("/services/{serviceId}")
  public ApiResponse<Object> deleteService(@PathVariable Long serviceId, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    venueAppService.deleteService(serviceId, owner);
    return ApiResponse.ok(null);
  }

  @PostMapping("/venues/{venueId}/business-hours")
  public ApiResponse<BusinessHour> addBusinessHour(@PathVariable Long venueId,
                                                   @Valid @RequestBody CreateBusinessHourRequest request,
                                                   HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(venueAppService.addBusinessHour(venueId, request, owner));
  }

  @PostMapping("/venues/{venueId}/blocks")
  public ApiResponse<AvailabilityBlock> addAvailabilityBlock(@PathVariable Long venueId,
                                                             @Valid @RequestBody CreateAvailabilityBlockRequest request,
                                                             HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(venueAppService.addAvailabilityBlock(venueId, request, owner));
  }

  @DeleteMapping("/business-hours/{id}")
  public ApiResponse<Object> deleteBusinessHour(@PathVariable Long id, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    venueAppService.deleteBusinessHour(id, owner);
    return ApiResponse.ok(null);
  }

  @DeleteMapping("/blocks/{id}")
  public ApiResponse<Object> deleteBlock(@PathVariable Long id, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    venueAppService.deleteBlock(id, owner);
    return ApiResponse.ok(null);
  }
}
