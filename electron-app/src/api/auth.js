import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const authApi = {
    login: async (email, password) => {
        return await client.post(API_ENDPOINTS.LOGIN, { email, password });
    },

    register: async (email, password) => {
        return await client.post(API_ENDPOINTS.REGISTER, { email, password });
    },

    logout: async () => {
        try {
            return await client.post(API_ENDPOINTS.LOGOUT, {}, true);
        } catch (error) {
            console.error('Logout API error:', error);
            return { success: false };
        }
    }
};
