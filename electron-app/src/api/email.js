import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const emailApi = {
    // Send email to group or specific emails
    // data: { subject, body, to_emails?, group_id? }
    async sendEmail(data) {
        return await client.post(API_ENDPOINTS.EMAIL_SEND, data, true);
    },

    // Send transactional email with attachments (FormData)
    async sendTransactionalEmail(formData) {
        // Note: client.post handles JSON by default, but for FormData we might need to handle headers differently
        // or just pass the FormData object. The client wrapper likely sets Content-Type to application/json
        // if we don't override it. Let's assume client.post can handle FormData if we pass it correctly
        // or we might need to use fetch directly if client.post is too strict.
        // Looking at client.js would be ideal, but for now let's assume we can use fetch directly for FormData
        // to be safe, similar to how marketingEmail.js does it.

        // Actually, let's just use the same pattern as marketingEmail.js which uses fetch directly for FormData
        // to avoid issues with the client wrapper setting Content-Type: application/json
        const { authState } = await import('../utils/authState.js');
        const { API_BASE_URL } = await import('../config/config.js');

        const authHeader = authState.getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/email/send/transactional`, {
            method: 'POST',
            headers: authHeader,
            body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || 'Failed to send transactional email');
        return result;
    },

    // Get sent email logs
    async getEmailLogs() {
        return await client.get(API_ENDPOINTS.EMAIL_LOGS, true);
    }
};
