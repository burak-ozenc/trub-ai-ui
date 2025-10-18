import { authUtils } from '../utils/auth';

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
    
    // Exercise endpoints
    async getExercises(technique = null, difficulty = null) {
        let url = `${this.baseURL}/exercises/?skip=0&limit=50`;
        if (technique) url += `&technique=${technique}`;
        if (difficulty) url += `&difficulty=${difficulty}`;

        const response = await fetch(url, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getRecommendedExercises(technique = null) {
        let url = `${this.baseURL}/exercises/recommended`;
        if (technique) url += `?technique=${technique}`;

        const response = await fetch(url, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getExercise(exerciseId) {
        const response = await fetch(`${this.baseURL}/exercises/${exerciseId}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    // Practice session endpoints
    async startPracticeSession(exerciseId) {
        const response = await fetch(`${this.baseURL}/practice/sessions`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ exercise_id: exerciseId }),
        });
        return this.handleResponse(response);
    }

    async completePracticeSession(sessionId, data) {
        const response = await fetch(`${this.baseURL}/practice/sessions/${sessionId}/complete`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(data),
        });
        return this.handleResponse(response);
    }

    async getPracticeSessions(skip = 0, limit = 50) {
        const response = await fetch(`${this.baseURL}/practice/sessions?skip=${skip}&limit=${limit}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getSessionFeedback(sessionId) {
        const response = await fetch(`${this.baseURL}/practice/sessions/${sessionId}/feedback`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    // Calendar endpoints
    async createCalendarEntry(entryData) {
        const response = await fetch(`${this.baseURL}/calendar/entries`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(entryData),
        });
        return this.handleResponse(response);
    }

    async getCalendarEntries(startDate, endDate) {
        const start = startDate.toISOString();
        const end = endDate.toISOString();
        const response = await fetch(
            `${this.baseURL}/calendar/entries?start_date=${start}&end_date=${end}`,
            {
                headers: this.getHeaders(true),
            }
        );
        return this.handleResponse(response);
    }

    async getEntriesByDate(date) {
        console.log(date)
        // Format: YYYY-MM-DD in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        console.log(dateStr)
        const response = await fetch(`${this.baseURL}/calendar/entries/date/${dateStr}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async getUpcomingPractices(limit = 10) {
        const response = await fetch(`${this.baseURL}/calendar/entries/upcoming?limit=${limit}`, {
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async updateCalendarEntry(entryId, updateData) {
        const response = await fetch(`${this.baseURL}/calendar/entries/${entryId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(updateData),
        });
        return this.handleResponse(response);
    }

    async completeCalendarEntry(entryId, practiceSessionId = null) {
        console.log(practiceSessionId)
        const response = await fetch(
            `${this.baseURL}/calendar/entries/${entryId}/complete?practice_session_id=${parseInt(practiceSessionId) || 0}`,
            {
                method: 'POST',
                headers: this.getHeaders(true),
            }
        );
        return this.handleResponse(response);
    }

    async deleteCalendarEntry(entryId) {
        const response = await fetch(`${this.baseURL}/calendar/entries/${entryId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    // Link practice session to calendar
    async startPracticeFromCalendar(calendarEntryId) {
        const response = await fetch(`${this.baseURL}/practice/sessions/from-calendar/${calendarEntryId}`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });
        return this.handleResponse(response);
    }

    async completePracticeWithCalendar(sessionId, calendarEntryId, data) {
        const response = await fetch(
            `${this.baseURL}/practice/sessions/${sessionId}/complete?calendar_entry_id=${calendarEntryId}`,
            {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(data),
            }
        );
        return this.handleResponse(response);
    }
}

export const api = new ApiClient(process.env.REACT_APP_BACKEND_URL);