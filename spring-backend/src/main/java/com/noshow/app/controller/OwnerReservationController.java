package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.ReservationDto;
import com.noshow.app.dto.UpdateReservationStatusRequest;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/reservations")
@RequiredArgsConstructor
public class OwnerReservationController {
  private final ReservationService reservationService;
  private final AuthService authService;

  @GetMapping("/{venueId}")
  public ApiResponse<List<ReservationDto>> listReservations(@PathVariable Long venueId,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int limit,
                                                            HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    var result = reservationService.listOwnerReservations(owner, venueId, page, limit);
    return ApiResponse.ok(result.data(), result.pagination());
  }

  @PostMapping("/{reservationId}/status")
  public ApiResponse<ReservationDto> updateStatus(@PathVariable Long reservationId,
                                                  @Valid @RequestBody UpdateReservationStatusRequest request,
                                                  HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    ReservationDto dto = reservationService.ownerUpdateStatus(reservationId, request.getAction(), request.getReason(), owner);
    return ApiResponse.ok(dto);
  }
}
