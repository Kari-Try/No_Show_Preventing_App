package com.noshow.app.service;

import com.noshow.app.domain.entity.Role;
import com.noshow.app.domain.entity.User;
import com.noshow.app.domain.entity.UserGrade;
import com.noshow.app.domain.entity.UserRole;
import com.noshow.app.domain.entity.UserRoleId;
import com.noshow.app.domain.repository.RoleRepository;
import com.noshow.app.domain.repository.UserGradeRepository;
import com.noshow.app.domain.repository.UserRepository;
import com.noshow.app.domain.repository.UserRoleRepository;
import com.noshow.app.dto.AuthResponse;
import com.noshow.app.dto.LoginRequest;
import com.noshow.app.dto.SignupRequest;
import com.noshow.app.dto.UserDto;
import com.noshow.app.security.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final UserGradeRepository userGradeRepository;
  private final UserRoleRepository userRoleRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final TokenService tokenService;
  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper;

  @Value("${naver.client-id:}")
  private String naverClientId;

  @Value("${naver.client-secret:}")
  private String naverClientSecret;

  @Value("${naver.callback-url:http://localhost:8000/auth/naver/callback}")
  private String naverCallbackUrl;

  @Value("${app.frontend-url:http://localhost:3000}")
  private String frontendUrl;

  @Transactional
  public AuthResponse signup(SignupRequest request) {
    if (request.getEmail() != null && !request.getEmail().isBlank()) {
      userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
      });
    }
    userRepository.findByUsername(request.getUsername()).ifPresent(u -> {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already registered");
    });
    userRepository.findByPhone(request.getPhone()).ifPresent(u -> {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone already registered");
    });

    String username = request.getUsername();
    String userId = ("u" + UUID.randomUUID().toString().replace("-", "")).substring(0, 16);
    UserGrade defaultGrade = userGradeRepository.findFirstByIsDefaultTrueOrderByPriorityAsc()
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default grade missing"));

    User user = User.builder()
      .userId(userId)
      .username(username)
      .phone(request.getPhone())
      .email(request.getEmail())
      .passwordHash(passwordEncoder.encode(request.getPassword()))
      .realName(request.getName())
      .loginType(User.LoginType.LOCAL)
      .grade(defaultGrade)
      .noShowCount(0)
      .successCount(0)
      .tosVersion("v1")
      .tosAcceptedAt(LocalDateTime.now())
      .privacyVersion("v1")
      .privacyAcceptedAt(LocalDateTime.now())
      .isActive(true)
      .build();

    userRepository.save(user);
    // 한 계정 = 한 역할 원칙: 요청 userType에 따라 단일 역할 부여
    if ("owner".equalsIgnoreCase(request.getUserType()) || "business".equalsIgnoreCase(request.getUserType())) {
      assignRoleExclusive(user, "owner");
    } else {
      assignRoleExclusive(user, "customer");
    }

    // load roles into entity for response
    user.getUserRoles().clear();
    user.getUserRoles().addAll(userRoleRepository.findByUser_UserId(userId));

    String token = tokenService.createToken(userId);
    return new AuthResponse(token, UserDto.fromEntity(user));
  }

  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    String id = request.getIdentifier();
    User user = userRepository.findByEmail(id)
      .or(() -> userRepository.findByUsername(id))
      .or(() -> userRepository.findByPhone(id))
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (user.getLoginType() == User.LoginType.NAVER) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Use Naver login for this account");
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    // ensure roles are loaded for response
    user.getUserRoles().clear();
    user.getUserRoles().addAll(userRoleRepository.findByUser_UserId(user.getUserId()));

    String token = tokenService.createToken(user.getUserId());
    return new AuthResponse(token, UserDto.fromEntity(user));
  }

  /**
   * Build Naver authorize URL and persist state in session.
   */
  public String naverAuthorizeUrl(HttpSession session) {
    if (naverClientId == null || naverClientId.isBlank() || naverClientSecret == null || naverClientSecret.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Naver OAuth is not configured");
    }
    String state = UUID.randomUUID().toString().replace("-", "");
    session.setAttribute("NAVER_STATE", state);
    String redirectUri = UriComponentsBuilder.fromHttpUrl(naverCallbackUrl).build().toUriString();
    return UriComponentsBuilder.fromHttpUrl("https://nid.naver.com/oauth2.0/authorize")
      .queryParam("response_type", "code")
      .queryParam("client_id", naverClientId)
      .queryParam("redirect_uri", redirectUri)
      .queryParam("state", state)
      .build()
      .toUriString();
  }

  /**
   * Handle Naver callback: verify state, exchange code for token, fetch profile, upsert user, and return frontend redirect URL.
   */
  @Transactional
  public String handleNaverCallback(String code, String state, HttpSession session) {
    String expectedState = (String) session.getAttribute("NAVER_STATE");
    if (expectedState == null || !expectedState.equals(state)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid state");
    }

    String tokenUrl = UriComponentsBuilder.fromHttpUrl("https://nid.naver.com/oauth2.0/token")
      .queryParam("grant_type", "authorization_code")
      .queryParam("client_id", naverClientId)
      .queryParam("client_secret", naverClientSecret)
      .queryParam("code", code)
      .queryParam("state", state)
      .build()
      .toUriString();

    ResponseEntity<String> tokenResponse = restTemplate.getForEntity(tokenUrl, String.class);
    try {
      JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
      String accessToken = tokenJson.path("access_token").asText(null);
      if (accessToken == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to get access token");
      }

      HttpHeaders headers = new HttpHeaders();
      headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
      headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
      HttpEntity<Void> entity = new HttpEntity<>(headers);
      ResponseEntity<String> profileResponse = restTemplate.exchange(
        "https://openapi.naver.com/v1/nid/me",
        org.springframework.http.HttpMethod.GET,
        entity,
        String.class
      );

      JsonNode profileJson = objectMapper.readTree(profileResponse.getBody());
      JsonNode resp = profileJson.path("response");
      if (resp.isMissingNode()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to fetch Naver profile");
      }

      String naverId = resp.path("id").asText();
      String email = resp.path("email").asText(null);
      String name = resp.path("name").asText(null);
      String nickname = resp.path("nickname").asText(null);
      String mobile = resp.path("mobile").asText(null);
      String profileImage = resp.path("profile_image").asText(null);

      User user = userRepository.findByNaverId(naverId).orElse(null);

      if (user == null && email != null) {
        user = userRepository.findByEmail(email).orElse(null);
      }

      if (user == null) {
        UserGrade defaultGrade = userGradeRepository.findFirstByIsDefaultTrueOrderByPriorityAsc()
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Default grade missing"));

        String username = nickname != null && !nickname.isBlank()
          ? nickname
          : (email != null ? generateUsername(email) : ("naver" + naverId.substring(0, Math.min(6, naverId.length()))));

        String userId = ("n" + UUID.randomUUID().toString().replace("-", "")).substring(0, 16);
        user = User.builder()
          .userId(userId)
          .username(username)
          .phone(mobile)
          .email(email)
          .passwordHash(null)
          .realName(name != null ? name : username)
          .loginType(User.LoginType.NAVER)
          .naverId(naverId)
          .profileImage(profileImage)
          .grade(defaultGrade)
          .noShowCount(0)
          .successCount(0)
          .tosVersion("v1")
          .tosAcceptedAt(LocalDateTime.now())
          .privacyVersion("v1")
          .privacyAcceptedAt(LocalDateTime.now())
          .isActive(true)
          .build();
      userRepository.save(user);
      assignRoleExclusive(user, "customer");
    } else {
      // Update linkage/profile info if existing user
      user.setLoginType(User.LoginType.NAVER);
      user.setNaverId(naverId);
      if (profileImage != null) user.setProfileImage(profileImage);
        if (name != null) user.setRealName(name);
        if (mobile != null) user.setPhone(mobile);
        userRepository.save(user);
      }

      // ensure roles are loaded for response
      user.getUserRoles().addAll(userRoleRepository.findByUser_UserId(user.getUserId()));

      String token = tokenService.createToken(user.getUserId());
      UserDto dto = UserDto.fromEntity(user);
      String userJson = objectMapper.writeValueAsString(dto);
      String redirect = UriComponentsBuilder.fromHttpUrl(frontendUrl + "/auth/callback")
        .queryParam("token", token)
        .queryParam("user", userJson)
        .build()
        .encode()
        .toUriString();
      return redirect;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Naver login failed: " + e.getMessage());
    } finally {
      session.removeAttribute("NAVER_STATE");
    }
  }

  @Transactional(readOnly = true)
  public User requireUser(HttpServletRequest request) {
    String token = tokenService.extractBearerToken(request)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required"));
    String userId = tokenService.resolveUserId(token)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));

    User user = userRepository.findById(userId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

    // initialize lazy relations needed outside the transaction
    if (user.getGrade() != null) {
      user.getGrade().getGradeName();
    }
    if (user.getUserRoles() != null) {
      user.getUserRoles().forEach(ur -> ur.getRole().getRoleName());
    }
    return user;
  }

  private String generateUsername(String email) {
    String prefix = email.split("@")[0].replaceAll("[^A-Za-z0-9]", "");
    if (prefix.length() < 4) {
      prefix = prefix + UUID.randomUUID().toString().substring(0, 4 - prefix.length());
    }
    String candidate = prefix;
    int i = 1;
    while (userRepository.findByUsername(candidate).isPresent()) {
      candidate = prefix + i;
      i++;
    }
    return candidate;
  }

  /**
   * 한 계정 = 한 역할 원칙으로, 기존 역할을 모두 제거 후 지정한 역할 하나만 부여한다.
   */
  private void assignRoleExclusive(User user, String roleName) {
    Optional<Role> roleOpt = roleRepository.findByRoleName(roleName);
    if (roleOpt.isEmpty()) {
      return;
    }
    Role role = roleOpt.get();
    userRoleRepository.deleteByUser_UserId(user.getUserId());
    UserRoleId id = new UserRoleId(user.getUserId(), role.getRoleId());
    UserRole userRole = UserRole.builder()
      .id(id)
      .user(user)
      .role(role)
      .build();
    userRoleRepository.save(userRole);
  }
}
