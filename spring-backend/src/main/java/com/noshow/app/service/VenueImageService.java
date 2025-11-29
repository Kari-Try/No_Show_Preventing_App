package com.noshow.app.service;

import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.Venue;
import com.noshow.app.domain.entity.VenueImage;
import com.noshow.app.domain.repository.VenueImageRepository;
import com.noshow.app.domain.repository.VenueRepository;
import com.noshow.app.dto.VenueImageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueImageService {
  private final VenueRepository venueRepository;
  private final VenueImageRepository venueImageRepository;

  @Transactional(readOnly = true)
  public List<VenueImageDto> listByVenue(Long venueId) {
    return venueImageRepository.findByVenue_VenueIdOrderByCreatedAtDesc(venueId).stream()
      .map(VenueImageDto::fromEntity)
      .collect(Collectors.toList());
  }

  @Transactional
  public VenueImageDto upload(Long venueId, byte[] data, String mimeType, User owner) {
    Venue venue = venueRepository.findById(venueId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    ensureOwner(venue, owner);
    if (data == null || data.length == 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is empty");
    }
    VenueImage image = VenueImage.builder()
      .venue(venue)
      .imageData(data)
      .mimeType(mimeType != null ? mimeType : "application/octet-stream")
      .build();
    venueImageRepository.save(image);
    return VenueImageDto.fromEntity(image);
  }

  @Transactional
  public void delete(Long imageId, User owner) {
    VenueImage image = venueImageRepository.findById(imageId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
    ensureOwner(image.getVenue(), owner);
    venueImageRepository.delete(image);
  }

  @Transactional(readOnly = true)
  public VenueImage findEntity(Long imageId) {
    return venueImageRepository.findById(imageId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
  }

  private void ensureOwner(Venue venue, User owner) {
    if (venue == null || owner == null || !venue.getOwner().getUserId().equals(owner.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can manage images");
    }
  }
}
