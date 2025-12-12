package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.UserRole;
import com.noshow.app.domain.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
  List<UserRole> findByUser_UserId(String userId);

  void deleteByUser_UserId(String userId);
}
