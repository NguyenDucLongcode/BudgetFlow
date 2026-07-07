export const RateLimitConfig = {
  // Auth Module
  auth: {
    login: { ttl: 900000, limit: 5 },
    register: { ttl: 3600000, limit: 3 },
    forgotPassword: { ttl: 3600000, limit: 3 },
    resetPassword: { ttl: 1800000, limit: 5 },
    refresh: { ttl: 300000, limit: 10 },
    resendVerification: { ttl: 3600000, limit: 3 },
    logout: { ttl: 60000, limit: 20 },
    logoutAll: { ttl: 60000, limit: 10 },
    sessions: { ttl: 60000, limit: 20 },
  },

  // Users Module
  users: {
    create: { ttl: 60000, limit: 10 },
    update: { ttl: 60000, limit: 20 },
    changePassword: { ttl: 60000, limit: 5 },
    delete: { ttl: 60000, limit: 5 },
  },

  // Global
  global: {
    get: { ttl: 60000, limit: 200 },
    post: { ttl: 60000, limit: 100 },
  },
} as const;

export type RateLimitConfigType = typeof RateLimitConfig;
