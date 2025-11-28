package com.noshow.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MyPageResponse {
  private String userId;
  private String username;
  private String realName;
  private String email;
  private String phone;
  private String gradeName;
  private Double gradeDiscountPercent;
  private long totalReservations;
  private long completedReservations;
  private long noShowReservations;
  private double completionRate; // 0~1
}
