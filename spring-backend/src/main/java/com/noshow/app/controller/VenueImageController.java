package com.noshow.app.controller;

import com.noshow.app.dto.VenueImageDto;
import com.noshow.app.service.VenueImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueImageController {
  private final VenueImageService venueImageService;

  @GetMapping("/{venueId}/images")
  public List<VenueImageDto> list(@PathVariable Long venueId) {
    return venueImageService.listByVenue(venueId);
  }

  @GetMapping("/images/{imageId}")
  public ResponseEntity<byte[]> image(@PathVariable Long imageId) {
    var img = venueImageService.findEntity(imageId);
    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_TYPE, img.getMimeType())
      .body(img.getImageData());
  }
}
