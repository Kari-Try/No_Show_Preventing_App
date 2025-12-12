package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

  @GetMapping("/")
  public ApiResponse<Map<String, String>> root() {
    return ApiResponse.ok(Map.of("message", "No-Show Prevention Platform API"));
  }
}
