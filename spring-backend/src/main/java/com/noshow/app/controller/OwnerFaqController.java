package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.CreateFaqRequest;
import com.noshow.app.dto.FaqDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.VenueFaqService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/faq")
@RequiredArgsConstructor
public class OwnerFaqController {
  private final VenueFaqService venueFaqService;
  private final AuthService authService;

  @GetMapping("/{venueId}")
  public ApiResponse<List<FaqDto>> list(@PathVariable Long venueId, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(venueFaqService.listByVenue(venueId, false));
  }

  @PostMapping
  public ApiResponse<FaqDto> create(@Valid @RequestBody CreateFaqRequest req, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(venueFaqService.create(req, owner));
  }

  @PutMapping("/{faqId}")
  public ApiResponse<FaqDto> update(@PathVariable Long faqId,
                                    @Valid @RequestBody CreateFaqRequest req,
                                    HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    return ApiResponse.ok(venueFaqService.update(faqId, req, owner));
  }

  @DeleteMapping("/{faqId}")
  public ApiResponse<Void> delete(@PathVariable Long faqId, HttpServletRequest servletRequest) {
    User owner = authService.requireUser(servletRequest);
    venueFaqService.delete(faqId, owner);
    return ApiResponse.ok(null);
  }
}
