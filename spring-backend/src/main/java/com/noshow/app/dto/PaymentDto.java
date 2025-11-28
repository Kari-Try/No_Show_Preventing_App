package com.noshow.app.dto;

import com.noshow.app.domain.entity.Payment;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentDto {
  private Long paymentId;
  private Payment.PaymentType paymentType;
  private String method;
  private BigDecimal amount;
  private String currency;
  private Payment.Status status;
  private LocalDateTime paidAt;

  public static PaymentDto fromEntity(Payment payment) {
    return PaymentDto.builder()
      .paymentId(payment.getPaymentId())
      .paymentType(payment.getPaymentType())
      .method(payment.getMethod())
      .amount(payment.getAmount())
      .currency(payment.getCurrency())
      .status(payment.getStatus())
      .paidAt(payment.getPaidAt())
      .build();
  }
}
