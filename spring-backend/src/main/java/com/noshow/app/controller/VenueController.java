package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.CreateVenueRequest;
import com.noshow.app.dto.VenueDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.VenueAppService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {
  private final VenueAppService venueAppService;
  private final AuthService authService;

  @GetMapping
  @Transactional(readOnly = true)
  public ApiResponse<List<VenueDto>> listVenues(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "9") int limit,
    @RequestParam(required = false) String search
  ) {
    Page<com.noshow.app.domain.entity.Venue> result = venueAppService.listVenues(page, limit, search);
    List<VenueDto> data = venueAppService.toVenueDtos(result, true);
    Pagination pagination = venueAppService.toPagination(result);
    return ApiResponse.ok(data, pagination);
  }

  @PostMapping
  public ApiResponse<VenueDto> createVenue(@Valid @RequestBody CreateVenueRequest request, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    var venue = venueAppService.createVenue(request, owner);
    return ApiResponse.ok(VenueDto.fromEntity(venue, false));
  }

  @Transactional(readOnly = true)
  @GetMapping("/{id}")
  public ApiResponse<VenueDto> getVenue(@PathVariable Long id) {
    var venue = venueAppService.getVenue(id);
    return ApiResponse.ok(VenueDto.fromEntity(venue, true));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Object> deleteVenue(@PathVariable Long id, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    venueAppService.deleteVenue(id, owner);
    return ApiResponse.ok(null);
  }
}
