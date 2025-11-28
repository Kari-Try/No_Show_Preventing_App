package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.common.Pagination;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.CancelReservationRequest;
import com.noshow.app.dto.CreateReservationRequest;
import com.noshow.app.dto.ReservationDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.ReservationService;
import com.noshow.app.service.ReservationService.ReservationsPage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
  private final ReservationService reservationService;
  private final AuthService authService;

  @PostMapping
  public ApiResponse<ReservationDto> createReservation(
    @Valid @RequestBody CreateReservationRequest request,
    HttpServletRequest servletRequest
  ) {
    User user = authService.requireUser(servletRequest);
    return ApiResponse.ok(reservationService.createReservation(request, user));
  }

  @GetMapping("/my-reservations")
  public ApiResponse<List<ReservationDto>> myReservations(
    @RequestParam(defaultValue = "1") int page,
    @RequestParam(defaultValue = "10") int limit,
    @RequestParam(required = false) String status,
    HttpServletRequest servletRequest
  ) {
    User user = authService.requireUser(servletRequest);
    ReservationsPage result = reservationService.listMyReservations(user, page, limit, status);
    return ApiResponse.ok(result.data(), result.pagination());
  }

  @PutMapping("/{id}/cancel")
  public ApiResponse<ReservationDto> cancelReservation(
    @PathVariable Long id,
    @Valid @RequestBody CancelReservationRequest request,
    HttpServletRequest servletRequest
  ) {
    User user = authService.requireUser(servletRequest);
    return ApiResponse.ok(reservationService.cancelReservation(id, request, user));
  }
}
