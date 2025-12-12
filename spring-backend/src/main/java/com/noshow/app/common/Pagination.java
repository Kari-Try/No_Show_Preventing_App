package com.noshow.app.common;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Pagination {
  private int page;
  private int limit;
  private long totalItems;
  private int totalPages;
}
