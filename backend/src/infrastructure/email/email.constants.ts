export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  RESET_PASSWORD: 'reset-password',
  VERIFICATION: 'verify-email',
  INVITE: 'invite',
} as const;

export const EMAIL_SUBJECTS = {
  WELCOME: 'Chào mừng bạn đến với BudgetFlow! 🎉',
  RESET_PASSWORD: 'Yêu cầu đặt lại mật khẩu',
  VERIFICATION: 'Xác thực tài khoản của bạn',
  INVITE: 'Lời mời tham gia BudgetFlow',
} as const;

export const EMAIL_QUEUE_NAME = 'email_queue';
