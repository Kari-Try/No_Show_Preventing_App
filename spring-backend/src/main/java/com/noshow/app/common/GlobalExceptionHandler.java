package com.noshow.app.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiResponse<Object>> handleStatus(ResponseStatusException ex) {
    return ResponseEntity.status(ex.getStatusCode())
      .body(ApiResponse.fail(ex.getReason() != null ? ex.getReason() : "Request failed"));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    for (FieldError error : ex.getBindingResult().getFieldErrors()) {
      errors.put(error.getField(), error.getDefaultMessage());
    }
    ApiResponse<Object> response = ApiResponse.<Object>builder()
      .success(false)
      .message("Validation failed")
      .data(errors)
      .build();
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex) {
    ApiResponse<Object> response = ApiResponse.fail("Server error: " + ex.getMessage());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Object>> handleConstraint(DataIntegrityViolationException ex) {
    String msg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "Constraint violation";
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail("Constraint violation: " + msg));
  }
}
