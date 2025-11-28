package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Short> {
  Optional<Role> findByRoleName(String roleName);
}
