package com.noshow.app.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenService {
  private final Map<String, String> tokenToUserId = new ConcurrentHashMap<>();

  public String createToken(String userId) {
    String token = UUID.randomUUID().toString();
    tokenToUserId.put(token, userId);
    return token;
  }

  public Optional<String> resolveUserId(String token) {
    return Optional.ofNullable(tokenToUserId.get(token));
  }

  public Optional<String> extractBearerToken(HttpServletRequest request) {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      return Optional.of(header.substring(7));
    }
    return Optional.empty();
  }
}
