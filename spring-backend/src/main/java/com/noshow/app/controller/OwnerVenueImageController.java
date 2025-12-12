package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.domain.entity.User;
import com.noshow.app.dto.VenueImageDto;
import com.noshow.app.service.AuthService;
import com.noshow.app.service.VenueImageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/venues")
@RequiredArgsConstructor
public class OwnerVenueImageController {
  private final VenueImageService venueImageService;
  private final AuthService authService;

  @GetMapping("/{venueId}/images")
  public ApiResponse<List<VenueImageDto>> list(@PathVariable Long venueId, HttpServletRequest request) {
    User owner = authService.requireUser(request);
    // 소유자 검증은 서비스에서 수행
    return ApiResponse.ok(venueImageService.listByVenue(venueId));
  }

  @PostMapping(value = "/{venueId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<VenueImageDto> upload(@PathVariable Long venueId,
                                           @RequestPart("image") MultipartFile file,
                                           HttpServletRequest request) throws Exception {
    User owner = authService.requireUser(request);
    byte[] bytes = file != null ? file.getBytes() : null;
    String mime = file != null ? file.getContentType() : null;
    return ApiResponse.ok(venueImageService.upload(venueId, bytes, mime, owner));
  }

  @DeleteMapping("/images/{imageId}")
  public ApiResponse<Void> delete(@PathVariable Long imageId, HttpServletRequest request) {
    User owner = authService.requireUser(request);
    venueImageService.delete(imageId, owner);
    return ApiResponse.ok(null);
  }
}
