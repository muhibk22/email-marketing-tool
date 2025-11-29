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
            console.log('[API Client] JSON Response:', responseData);

            if (!response.ok) {
                const errorMessage = responseData.detail || responseData.message || 'API request failed';
                console.error('[API Client] API Error:', errorMessage);
                throw new Error(errorMessage);
            }
            return responseData;
        } else {
            const text = await response.text();
            console.log('[API Client] Text Response:', text);

            if (!response.ok) {
                const match = text.match(/<title>(.*?)<\/title>/i);
                const errorMessage = match ? match[1] : 'Server returned an error';
                console.error('[API Client] Server Error:', errorMessage);
                throw new Error(errorMessage);
            }
            return text;
        }
    }

    async request(endpoint, options = {}, includeAuth = false) {
        console.log('[API Client] Starting request:', {
            endpoint,
            baseUrl: this.baseUrl,
            fullUrl: `${this.baseUrl}${endpoint}`,
            method: options.method || 'GET',
            includeAuth
        });

        try {
            const headers = this.buildHeaders(options.headers, includeAuth);
            console.log('[API Client] Headers built:', headers);

            const fetchUrl = `${this.baseUrl}${endpoint}`;
            const fetchOptions = {
                ...options,
                headers
            };

            console.log('[API Client] Calling fetch with:', { url: fetchUrl, options: fetchOptions });

            const response = await fetch(fetchUrl, fetchOptions);

            console.log('[API Client] Fetch response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            return await this.processResponse(response);
        } catch (error) {
            console.error('[API Client] Error occurred:', error);
            console.error('[API Client] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
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
