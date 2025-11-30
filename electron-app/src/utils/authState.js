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

    setUserName(name) {
        if (name) {
            localStorage.setItem('user_name', name);
        }
    }

    getUserName() {
        return localStorage.getItem('user_name');
    }

    setUserDetails(details) {
        if (details.name) this.setUserName(details.name);
        if (details.company_name) localStorage.setItem('company_name', details.company_name);
        if (details.phone) localStorage.setItem('user_phone', details.phone);
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    clearAuth() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem('user_name');
        localStorage.removeItem('company_name');
        localStorage.removeItem('user_phone');
    }

    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export const authState = new AuthState();
