package com.noshow.app.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
  private boolean success;
  private T data;
  private String message;
  private Object pagination;

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder().success(true).data(data).build();
  }

  public static <T> ApiResponse<T> ok(T data, Object pagination) {
    return ApiResponse.<T>builder().success(true).data(data).pagination(pagination).build();
  }

  public static <T> ApiResponse<T> fail(String message) {
    return ApiResponse.<T>builder().success(false).message(message).build();
  }
}
