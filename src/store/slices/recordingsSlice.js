import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialState = {
    recordings: [], // Array of recording objects
    currentRecording: null,
    isPlaying: false,
    playingId: null,
    loading: false,
    error: null,
    hasFetched: false  // Track if we've fetched
};

// Async thunks for API calls
export const fetchRecordings = createAsyncThunk(
    'recordings/fetchRecordings',
    async (_, { rejectWithValue }) => {
        try {
            const data = await api.getRecordings();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const saveRecordingToDb = createAsyncThunk(
    'recordings/saveRecordingToDb',
    async (recordingData, { rejectWithValue }) => {
        try {
            const data = await api.saveRecording(recordingData);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteRecordingFromDb = createAsyncThunk(
    'recordings/deleteRecordingFromDb',
    async (recordingId, { rejectWithValue }) => {
        try {
            await api.deleteRecording(recordingId);
            return recordingId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const recordingsSlice = createSlice({
    name: 'recordings',
    initialState,
    reducers: {
        // Add new recording to local state (for immediate UI update)
        addRecordingLocal: (state, action) => {
            const newRecording = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                guidance: action.payload.guidance,
                audioBlob: action.payload.audioBlob,
                analysis: action.payload.analysis,
                fileName: action.payload.fileName || `recording_${Date.now()}.wav`
            };
            state.recordings.unshift(newRecording); // Add to beginning

            // Keep only last 50 recordings
            if (state.recordings.length > 50) {
                state.recordings = state.recordings.slice(0, 50);
            }
        },

        // Delete a recording (local only - use deleteRecordingFromDb for DB)
        deleteRecording: (state, action) => {
            state.recordings = state.recordings.filter(
                rec => rec.id !== action.payload
            );
            if (state.playingId === action.payload) {
                state.isPlaying = false;
                state.playingId = null;
            }
        },

        // Set current recording for playback
        setCurrentRecording: (state, action) => {
            state.currentRecording = action.payload;
        },

        // Start playing a recording
        startPlaying: (state, action) => {
            state.isPlaying = true;
            state.playingId = action.payload;
        },

        // Stop playing
        stopPlaying: (state) => {
            state.isPlaying = false;
            state.playingId = null;
        },

        // Clear all recordings (local only)
        clearAllRecordings: (state) => {
            state.recordings = [];
            state.currentRecording = null;
            state.isPlaying = false;
            state.playingId = null;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch recordings
        builder
            .addCase(fetchRecordings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecordings.fulfilled, (state, action) => {
                state.loading = false;
                state.recordings = action.payload;
            })
            .addCase(fetchRecordings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Save recording to database
        builder
            .addCase(saveRecordingToDb.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveRecordingToDb.fulfilled, (state, action) => {
                state.loading = false;
                // Add the new recording from database (has proper ID)
                state.recordings.unshift(action.payload);

                // Keep only last 50 recordings
                if (state.recordings.length > 50) {
                    state.recordings = state.recordings.slice(0, 50);
                }
            })
            .addCase(saveRecordingToDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete recording from database
        builder
            .addCase(deleteRecordingFromDb.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRecordingFromDb.fulfilled, (state, action) => {
                state.loading = false;
                state.recordings = state.recordings.filter(
                    rec => rec.id !== action.payload
                );
                if (state.playingId === action.payload) {
                    state.isPlaying = false;
                    state.playingId = null;
                }
            })
            .addCase(deleteRecordingFromDb.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    addRecordingLocal,
    deleteRecording,
    setCurrentRecording,
    startPlaying,
    stopPlaying,
    clearAllRecordings,
    clearError
} = recordingsSlice.actions;

export default recordingsSlice.reducer;