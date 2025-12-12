package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.dto.FaqDto;
import com.noshow.app.service.VenueFaqService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faq")
@RequiredArgsConstructor
public class FaqController {
  private final VenueFaqService venueFaqService;

  @GetMapping("/venue/{venueId}")
  public ApiResponse<List<FaqDto>> listByVenue(@PathVariable Long venueId) {
    return ApiResponse.ok(venueFaqService.listByVenue(venueId, true));
  }
}
