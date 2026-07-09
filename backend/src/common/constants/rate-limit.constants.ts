export const RATE_LIMIT = {
  AUTH: {
    LOGIN: {
      ttl: 15 * 60,
      limit: 5,
    },

    REGISTER: {
      ttl: 60 * 60,
      limit: 3,
    },

    REFRESH: {
      ttl: 60,
      limit: 60,
    },

    LOGOUT: {
      ttl: 60,
      limit: 20,
    },

    LOGOUT_ALL: {
      ttl: 60,
      limit: 10,
    },

    FORGOT_PASSWORD: {
      ttl: 60 * 60,
      limit: 3,
    },

    RESET_PASSWORD: {
      ttl: 30 * 60,
      limit: 5,
    },

    RESEND_VERIFICATION: {
      ttl: 60 * 60,
      limit: 3,
    },
  },

  ADMIN: {
    DASHBOARD: {
      ttl: 60 * 1000,
      limit: 60,
    },

    USERS: {
      ttl: 60 * 1000,
      limit: 100,
    },

    USER_DETAIL: {
      ttl: 60 * 1000,
      limit: 100,
    },

    UPDATE_USER: {
      ttl: 60 * 1000,
      limit: 50,
    },

    TOGGLE_ACTIVE: {
      ttl: 60 * 1000,
      limit: 30,
    },

    DELETE_USER: {
      ttl: 60 * 1000,
      limit: 10,
    },

    USER_SESSIONS: {
      ttl: 60 * 1000,
      limit: 50,
    },

    REVOKE_USER_SESSION: {
      ttl: 60 * 1000,
      limit: 20,
    },

    REVOKE_ALL_USER_SESSIONS: {
      ttl: 60 * 1000,
      limit: 10,
    },
  },

  // user thường
  USER: {
    PROFILE: {
      ttl: 60 * 1000,
      limit: 100,
    },

    UPDATE_PROFILE: {
      ttl: 60 * 1000,
      limit: 20,
    },

    CHANGE_PASSWORD: {
      ttl: 60 * 1000,
      limit: 5,
    },

    SESSIONS: {
      ttl: 60 * 1000,
      limit: 30,
    },

    REVOKE_SESSION: {
      ttl: 60 * 1000,
      limit: 20,
    },

    REVOKE_ALL_SESSIONS: {
      ttl: 60 * 1000,
      limit: 5,
    },
  },

  // Global
  GLOBAL: {
    GET: {
      ttl: 60 * 1000,
      limit: 200,
    },

    POST: {
      ttl: 60 * 1000,
      limit: 100,
    },

    PUT: {
      ttl: 60 * 1000,
      limit: 80,
    },

    PATCH: {
      ttl: 60 * 1000,
      limit: 80,
    },

    DELETE: {
      ttl: 60 * 1000,
      limit: 50,
    },
  },
} as const;
