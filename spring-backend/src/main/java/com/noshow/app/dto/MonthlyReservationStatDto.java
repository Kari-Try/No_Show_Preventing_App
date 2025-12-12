package com.noshow.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyReservationStatDto {
  private String ym;
  private long totalResv;
  private long noshowCnt;
  private long completedCnt;
  private long canceledCnt;
}
