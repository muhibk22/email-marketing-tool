import { STORAGE_KEYS } from './constants.js';

class AuthState {
    setToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }
    }

    getToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    setUserEmail(email) {
        if (email) {
            localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
        }
    }

    getUserEmail() {
        return localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    clearAuth() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }

    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const authState = new AuthState();
