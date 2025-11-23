// backend/utils/validation.js
// 이메일 유효성 검사
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 유효성 검사
exports.validatePhone = (phone) => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

// 비밀번호 유효성 검사 (최소 8자)
exports.validatePassword = (password) => {
  return password && password.length >= 8;
};