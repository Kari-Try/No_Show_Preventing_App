package com.noshow.app.domain.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class LoginTypeConverter implements AttributeConverter<User.LoginType, String> {
  @Override
  public String convertToDatabaseColumn(User.LoginType attribute) {
    return attribute == null ? null : attribute.name().toLowerCase();
  }

  @Override
  public User.LoginType convertToEntityAttribute(String dbData) {
    if (dbData == null) return null;
    return User.LoginType.valueOf(dbData.toUpperCase());
  }
}
