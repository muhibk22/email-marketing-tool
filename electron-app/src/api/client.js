import { API_BASE_URL } from '../config/config.js';
import { authState } from '../utils/authState.js';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    buildHeaders(customHeaders = {}, includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        if (includeAuth) {
            const authHeader = authState.getAuthHeader();
            Object.assign(headers, authHeader);
        }

        return headers;
    }

    async processResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            if (!response.ok) {
                const errorMessage = responseData.detail || responseData.message || 'API request failed';
                throw new Error(errorMessage);
            }
            return responseData;
        } else {
            const text = await response.text();
            if (!response.ok) {
                const match = text.match(/<title>(.*?)<\/title>/i);
                const errorMessage = match ? match[1] : 'Server returned an error';
                throw new Error(errorMessage);
            }
            return text;
        }
    }

    async request(endpoint, options = {}, includeAuth = false) {
        try {
            const headers = this.buildHeaders(options.headers, includeAuth);

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            return await this.processResponse(response);
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(error.message || 'An error occurred during the request');
        }
    }

    async post(endpoint, data, includeAuth = false) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        }, includeAuth);
    }

    async get(endpoint, includeAuth = false) {
        return this.request(endpoint, {
            method: 'GET'
        }, includeAuth);
    }

    async put(endpoint, data, includeAuth = false) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        }, includeAuth);
    }

    async delete(endpoint, includeAuth = false) {
        return this.request(endpoint, {
            method: 'DELETE'
        }, includeAuth);
    }

    async patch(endpoint, data, includeAuth = false) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }, includeAuth);
    }
}

export const client = new ApiClient(API_BASE_URL);
