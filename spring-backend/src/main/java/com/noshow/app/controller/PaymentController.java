package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.DepositPaymentRequest;
import com.noshow.app.dto.PaymentDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
  private final ReservationService reservationService;
  private final AuthService authService;

  @PostMapping("/deposit")
  public ApiResponse<PaymentDto> payDeposit(
    @Valid @RequestBody DepositPaymentRequest request,
    HttpServletRequest servletRequest
  ) {
    User user = authService.requireUser(servletRequest);
    PaymentDto dto = reservationService.payDeposit(request.getReservationId(), request.getPaymentMethod(), user);
    return ApiResponse.ok(dto);
  }
}
