import { client } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const emailApi = {
    // Send email to group or specific emails
    // data: { subject, body, to_emails?, group_id? }
    async sendEmail(data) {
        return await client.post(API_ENDPOINTS.EMAIL_SEND, data, true);
    },

    // Get sent email logs
    async getEmailLogs() {
        return await client.get(API_ENDPOINTS.EMAIL_LOGS, true);
    }
};
