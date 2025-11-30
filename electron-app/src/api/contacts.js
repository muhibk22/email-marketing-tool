import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';
import { authState } from '../utils/authState.js';
import { API_BASE_URL } from '../config/config.js';

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
    },

    // Import contacts from file
    // Parse import file (step 1)
    async parseImportContacts(formData) {
        const authHeader = authState.getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/contacts/parse-import`, {
            method: 'POST',
            headers: authHeader,
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.detail || result.message || 'Failed to parse import file');
        }
        return result;
    },

    // Bulk create contacts (step 2)
    async bulkCreateContacts(data) {
        return await client.post(`${API_ENDPOINTS.CONTACTS}/bulk`, data, true);
    }
};
