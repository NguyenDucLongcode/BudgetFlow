export const PasswordStrengthRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_POLICY_MESSAGE = [
  'Mật khẩu phải có ít nhất 8 ký tự',
  'Một chữ hoa',
  'Một chữ thường',
  'Một số',
  'Một ký tự đặc biệt',
].join(', ');
