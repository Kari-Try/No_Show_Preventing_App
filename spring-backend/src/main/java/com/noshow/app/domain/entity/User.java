package com.noshow.app.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import com.noshow.app.domain.entity.UserGrade;
import com.noshow.app.domain.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
  public enum LoginType { LOCAL, NAVER }

  @Id
  @Column(name = "user_id", nullable = false, length = 30)
  private String userId;

  @Column(name = "username", nullable = false, length = 30, unique = true)
  private String username;

  @Column(name = "phone", length = 20, unique = true)
  private String phone;

  @Column(name = "email", length = 255, unique = true)
  private String email;

  @Column(name = "password_hash", length = 128)
  private String passwordHash;

  @Column(name = "real_name", nullable = false, length = 50)
  private String realName;

  @Enumerated(EnumType.STRING)
  @Column(name = "login_type", nullable = false, length = 10)
  private LoginType loginType;

  @Column(name = "naver_id", length = 100, unique = true)
  private String naverId;

  @Column(name = "profile_image", length = 500)
  private String profileImage;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "grade_id")
  @ToString.Exclude
  private UserGrade grade;

  @Column(name = "no_show_count", nullable = false)
  private Integer noShowCount;

  @Column(name = "success_count", nullable = false)
  private Integer successCount;

  @Column(name = "tos_version", nullable = false, length = 20)
  private String tosVersion;

  @Column(name = "tos_accepted_at", nullable = false)
  private LocalDateTime tosAcceptedAt;

  @Column(name = "privacy_version", nullable = false, length = 20)
  private String privacyVersion;

  @Column(name = "privacy_accepted_at", nullable = false)
  private LocalDateTime privacyAcceptedAt;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false, insertable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", insertable = false)
  private LocalDateTime updatedAt;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Builder.Default
  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
  @ToString.Exclude
  private Set<UserRole> userRoles = new HashSet<>();
}
