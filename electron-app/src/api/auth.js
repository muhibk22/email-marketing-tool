import { client } from './client.js';

export const authApi = {
    login: async (email, password) => {
        return await client.post('/auth/login', { email, password });
    },

    register: async (email, password) => {
        return await client.post('/auth/register', { email, password });
    }
};
