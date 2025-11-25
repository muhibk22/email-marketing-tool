const BASE_URL = 'http://localhost:8000';

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Add get, put, delete methods as needed
}

export const client = new ApiClient(BASE_URL);
