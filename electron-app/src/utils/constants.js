export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    RECIPIENTS: '/recipients',
    CAMPAIGNS: '/campaigns',
    MARKETING_EMAIL: '/marketing-email',
    TRANSACTIONAL_EMAIL: '/transactional-email',
    AI_GENERATOR: '/ai-generator',
    EMAIL_LOGS: '/email-logs'
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_EMAIL: 'user_email',
    REFRESH_TOKEN: 'refresh_token'
};

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',

    // Contacts (Recipients)
    CONTACTS: '/contacts',
    CONTACT_BY_ID: (id) => `/contacts/${id}`,

    // Groups (Campaigns)
    GROUPS: '/groups',
    GROUP_BY_ID: (id) => `/groups/${id}`,

    // Email
    EMAIL_SEND: '/email/send',
    EMAIL_SEND_NEWSLETTER: '/email/send/newsletter',

    // AI
    AI_GENERATE: '/ai-email/generate',
    EMAIL_LOGS: '/email/logs'
};

export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_BYTES: 72,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export const UI = {
    SUCCESS_REDIRECT_DELAY: 1500,
    LOADING_MIN_DURATION: 300,
    ERROR_DISPLAY_DURATION: 5000
};

export const MESSAGE_TYPES = {
    ERROR: 'error',
    SUCCESS: 'success',
    INFO: 'info',
    WARNING: 'warning'
};
