package com.noshow.app.dto;

import com.noshow.app.domain.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class UserDto {
  private String userId;
  private String username;
  private String realName;
  private String email;
  private String phone;
  private Short gradeId;
  private String gradeName;
  private String loginType;
  private String profileImage;
  private List<String> roles;

  public static UserDto fromEntity(User user) {
    return UserDto.builder()
      .userId(user.getUserId())
      .username(user.getUsername())
      .realName(user.getRealName())
      .email(user.getEmail())
      .phone(user.getPhone())
      .gradeId(user.getGrade() != null ? user.getGrade().getGradeId() : null)
      .gradeName(user.getGrade() != null ? user.getGrade().getGradeName() : null)
      .loginType(user.getLoginType() != null ? user.getLoginType().name().toLowerCase() : "local")
      .profileImage(user.getProfileImage())
      .roles(user.getUserRoles() != null
        ? user.getUserRoles().stream()
            .map(ur -> ur.getRole().getRoleName())
            .collect(Collectors.toList())
        : List.of())
      .build();
  }
}
