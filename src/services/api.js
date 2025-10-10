import { authUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:8002';

// Create API client with auth support
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    // Get headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = authUtils.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Handle API response
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || 'Request failed');
        }

        // Handle 204 No Content responses (like DELETE)
        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    // Auth endpoints
    async register(userData) {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(userData),
        });
        return this.handleResponse(response);
    }

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });
        return this.handleResponse(response);
    }

    async getCurrentUser() {
        const response = await fetch(`${this.baseURL}/auth/me`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async updateProfile(profileData) {
        const response = await fetch(`${this.baseURL}/users/me`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(profileData),
        });
        return this.handleResponse(response);
    }

    // Analysis endpoints
    async analyzeAudio(audioBlob, guidance, analysisType = 'full') {
        const formData = new FormData();
        formData.append('audioData', audioBlob);
        formData.append('guidance', guidance);
        formData.append('analysis_type', analysisType);

        const token = authUtils.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}/analysis/comprehensive`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return this.handleResponse(response);
    }

    async askQuestion(question) {
        const formData = new FormData();
        formData.append('question', question);

        const token = authUtils.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}/llm/ask-question`, {
            method: 'POST',
            headers,
            body: formData,
        });
        return this.handleResponse(response);
    }

    // Recording endpoints (NEW)
    async saveRecording(recordingData) {
        // Remove tempId before sending to backend
        const { tempId, ...dataToSend } = recordingData;

        const response = await fetch(`${this.baseURL}/recordings/`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(dataToSend),
        });
        return this.handleResponse(response);
    }

    async getRecordings(skip = 0, limit = 50) {
        const response = await fetch(`${this.baseURL}/recordings/?skip=${skip}&limit=${limit}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getRecording(recordingId) {
        const response = await fetch(`${this.baseURL}/recordings/${recordingId}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getRecordingAudio(recordingId) {
        const token = authUtils.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}/recordings/${recordingId}/audio`, {
            headers,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch audio');
        }

        return response.blob();
    }

    async deleteRecording(recordingId) {
        const response = await fetch(`${this.baseURL}/recordings/${recordingId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getRecordingCount() {
        const response = await fetch(`${this.baseURL}/recordings/stats/count`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getProgressStats() {
        const response = await fetch(`${this.baseURL}/recordings/stats/progress`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }
}

export const api = new ApiClient(API_BASE_URL);