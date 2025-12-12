package com.noshow.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GradeCountDto {
  private String gradeName;
  private long usersInGrade;
}
