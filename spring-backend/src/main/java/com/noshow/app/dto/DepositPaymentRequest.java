package com.noshow.app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepositPaymentRequest {
  @NotNull
  private Long reservationId;

  private String paymentMethod = "card";
}
