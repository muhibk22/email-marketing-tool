export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/home'
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_EMAIL: 'user_email',
    REFRESH_TOKEN: 'refresh_token'
};

export const API_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
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
