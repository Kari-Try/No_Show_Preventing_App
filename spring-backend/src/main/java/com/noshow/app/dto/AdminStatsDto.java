package com.noshow.app.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDto {
  private long totalUsers;
  private long totalOwners;
  private long totalCustomers;
  private long totalVenues;
  private long reservationsThisMonth;
  private long noshowsThisMonth;
}
