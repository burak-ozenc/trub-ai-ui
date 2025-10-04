import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    recordings: [], // Array of recording objects
    currentRecording: null,
    isPlaying: false,
    playingId: null
};

const recordingsSlice = createSlice({
    name: 'recordings',
    initialState,
    reducers: {
        // Add new recording to history
        addRecording: (state, action) => {
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

        // Delete a recording
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

        // Clear all recordings
        clearAllRecordings: (state) => {
            state.recordings = [];
            state.currentRecording = null;
            state.isPlaying = false;
            state.playingId = null;
        }
    }
});
    
export const {
    addRecording,
    deleteRecording,
    setCurrentRecording,
    startPlaying,
    stopPlaying,
    clearAllRecordings
} = recordingsSlice.actions;

export default recordingsSlice.reducer;