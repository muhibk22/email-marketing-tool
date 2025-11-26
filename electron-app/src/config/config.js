const ENV = (typeof window !== 'undefined' && window.APP_ENV) || 'development';

const config = {
    development: {
        apiBaseUrl: 'http://localhost:8000',
        enableDevTools: true,
        logLevel: 'debug'
    },
    production: {
        apiBaseUrl: 'https://api.yourdomain.com',
        enableDevTools: false,
        logLevel: 'error'
    },
    staging: {
        apiBaseUrl: 'https://staging-api.yourdomain.com',
        enableDevTools: true,
        logLevel: 'info'
    }
};

export const API_BASE_URL = config[ENV].apiBaseUrl;
export const ENABLE_DEV_TOOLS = config[ENV].enableDevTools;
export const LOG_LEVEL = config[ENV].logLevel;
export const ENVIRONMENT = ENV;
