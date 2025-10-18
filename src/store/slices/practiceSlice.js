import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunks
export const startSession = createAsyncThunk(
    'practice/startSession',
    async (exerciseId) => {
        return await api.startPracticeSession(exerciseId);
    }
);

export const completeSession = createAsyncThunk(
    'practice/completeSession',
    async ({ sessionId, data }) => {
        return await api.completePracticeSession(sessionId, data);
    }
);

export const fetchSessions = createAsyncThunk(
    'practice/fetchSessions',
    async () => {
        return await api.getPracticeSessions();
    }
);

export const fetchSessionFeedback = createAsyncThunk(
    'practice/fetchFeedback',
    async (sessionId) => {
        return await api.getSessionFeedback(sessionId);
    }
);

const practiceSlice = createSlice({
    name: 'practice',
    initialState: {
        currentSession: null,
        sessions: [],
        currentFeedback: null,
        isSessionActive: false,
        sessionStartTime: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSessionStartTime: (state, action) => {
            state.sessionStartTime = action.payload;
        },
        clearCurrentSession: (state) => {
            state.currentSession = null;
            state.isSessionActive = false;
            state.sessionStartTime = null;
            state.currentFeedback = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Start session
            .addCase(startSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startSession.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSession = action.payload;
                state.isSessionActive = true;
                state.sessionStartTime = Date.now();
            })
            .addCase(startSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Complete session
            .addCase(completeSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(completeSession.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSession = action.payload;
                state.isSessionActive = false;
            })
            .addCase(completeSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch sessions
            .addCase(fetchSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch feedback
            .addCase(fetchSessionFeedback.fulfilled, (state, action) => {
                state.currentFeedback = action.payload;
            });
    },
});

export const { setSessionStartTime, clearCurrentSession } = practiceSlice.actions;
export default practiceSlice.reducer;