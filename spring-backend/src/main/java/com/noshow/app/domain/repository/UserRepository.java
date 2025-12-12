package com.noshow.app.domain.repository;

import com.noshow.app.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findByEmail(String email);
  Optional<User> findByUsername(String username);
  Optional<User> findByNaverId(String naverId);
  Optional<User> findByPhone(String phone);

  @Query("select u from User u join u.userRoles ur join ur.role r where lower(r.roleName) = lower(:roleName)")
  Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

  Page<User> findByGrade_GradeNameIgnoreCase(String gradeName, Pageable pageable);
}
