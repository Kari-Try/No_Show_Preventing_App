package com.noshow.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OwnerReplyRequest {
  @NotBlank
  private String reply;
}
