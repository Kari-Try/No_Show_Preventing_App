package com.noshow.app.controller;

import com.noshow.app.common.ApiResponse;
import com.noshow.app.dto.AuthResponse;
import com.noshow.app.dto.LoginRequest;
import com.noshow.app.dto.SignupRequest;
import com.noshow.app.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/signup")
  public ApiResponse<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
    return ApiResponse.ok(authService.signup(request));
  }

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.ok(authService.login(request));
  }

  @GetMapping("/naver")
  public ApiResponse<Map<String, Object>> naverAuth(HttpSession session) {
    String url = authService.naverAuthorizeUrl(session);
    return ApiResponse.ok(Map.of("success", true, "url", url));
  }

  @GetMapping("/naver/callback")
  public ResponseEntity<Void> naverCallback(String code, String state, HttpSession session) {
    String redirectUrl = authService.handleNaverCallback(code, state, session);
    HttpHeaders headers = new HttpHeaders();
    headers.setLocation(java.net.URI.create(redirectUrl));
    return new ResponseEntity<>(headers, HttpStatus.FOUND);
  }
}
