import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const contactsApi = {
    // Get all contacts for current user
    async getContacts() {
        return await client.get(API_ENDPOINTS.CONTACTS, true);
    },

    // Create a new contact
    async createContact(data) {
        return await client.post(API_ENDPOINTS.CONTACTS, data, true);
    },

    // Update a contact
    async updateContact(id, data) {
        return await client.put(API_ENDPOINTS.CONTACT_BY_ID(id), data, true);
    },

    // Delete a contact
    async deleteContact(id) {
        return await client.delete(API_ENDPOINTS.CONTACT_BY_ID(id), true);
    }
};
