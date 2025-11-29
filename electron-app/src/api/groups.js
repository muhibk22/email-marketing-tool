import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const groupsApi = {
    // Get all groups for current user
    async getGroups() {
        return await client.get(API_ENDPOINTS.GROUPS, true);
    },

    // Get a single group
    async getGroup(id) {
        return await client.get(API_ENDPOINTS.GROUP_BY_ID(id), true);
    },

    // Create a new group
    async createGroup(data) {
        return await client.post(API_ENDPOINTS.GROUPS, data, true);
    },

    // Update a group (rename or modify contacts)
    async updateGroup(id, data) {
        return await client.put(API_ENDPOINTS.GROUP_BY_ID(id), data, true);
    },

    // Delete a group
    async deleteGroup(id) {
        return await client.delete(API_ENDPOINTS.GROUP_BY_ID(id), true);
    }
};
