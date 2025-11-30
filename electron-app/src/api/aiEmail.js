import { ApiClient } from './client.js';
import { API_ENDPOINTS } from '../utils/constants.js';

class AIEmailApi extends ApiClient {
    async generateEmail(data) {
        return this.post(API_ENDPOINTS.AI_GENERATE, data, true);
    }
}

import { API_BASE_URL } from '../config/config.js';

export const aiEmailApi = new AIEmailApi(API_BASE_URL);
