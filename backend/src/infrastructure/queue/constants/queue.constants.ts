export const QUEUE = {
  CLEANUP: 'cleanup',
  EMAIL: 'email',
  AUDIT: 'audit',
} as const;

export const CLEANUP_JOB = {
  REMOVE_INACTIVE_USERS: 'remove-inactive-users',
} as const;

export const EMAIL_JOB = {
  SEND_VERIFY_EMAIL: 'send-verify-email',
  SEND_RESET_PASSWORD: 'send-reset-password',
} as const;
