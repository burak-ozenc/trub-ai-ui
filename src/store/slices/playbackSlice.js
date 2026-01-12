import { createSlice } from '@reduxjs/toolkit';

/**
 * Enhanced Playback State Slice
 *
 * Manages global playback state for audio sync with sheet music
 * Now includes note validation and real-time feedback
 */
const playbackSlice = createSlice({
    name: 'playback',
    initialState: {
        // Basic playback state
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        tempo: 100,

        // Session info
        sessionId: null,
        songId: null,
        difficulty: null,

        // Note tracking
        currentNoteIndex: -1,
        totalNotes: 0,

        // Mode
        playMode: 'flow', // 'wait' | 'flow'

        // Current note validation
        expectedNote: null, // { pitch, frequency, startTime, endTime, duration, index }
        detectedPitch: null, // { note, octave, frequency, cents, isDetecting }
        noteStartTime: null, // When user started playing current note
        currentNoteResult: null, // Latest validation result

        // Note results history
        noteResults: [], // [{ index, result, accuracy, pitchAccuracy, durationAccuracy, timestamp }]

        // Session statistics
        sessionStats: {
            totalNotes: 0,
            correctNotes: 0,
            closeNotes: 0,
            wrongNotes: 0,
            silentNotes: 0,
            overallAccuracy: 0,
            pitchAccuracy: 0,
            durationAccuracy: 0
        },

        // Recording state (for optional deep analysis)
        isRecording: false,
        recordingStartTime: null,
    },
    reducers: {
        // ========== Basic Playback ==========
        setPlaying: (state, action) => {
            state.isPlaying = action.payload;
        },

        updateCurrentTime: (state, action) => {
            state.currentTime = action.payload;
        },

        setDuration: (state, action) => {
            state.duration = action.payload;
        },

        setTempo: (state, action) => {
            state.tempo = action.payload;
        },

        seekTo: (state, action) => {
            state.currentTime = action.payload;
        },

        // ========== Session Management ==========
        initializePlayback: (state, action) => {
            const { sessionId, songId, difficulty, duration, totalNotes } = action.payload;

            state.sessionId = sessionId;
            state.songId = songId;
            state.difficulty = difficulty;
            state.duration = duration || 0;
            state.totalNotes = totalNotes || 0;

            // Reset state
            state.currentTime = 0;
            state.isPlaying = false;
            state.currentNoteIndex = -1;
            state.noteResults = [];
            state.expectedNote = null;
            state.detectedPitch = null;
            state.noteStartTime = null;
            state.currentNoteResult = null;

            // Reset stats
            state.sessionStats = {
                totalNotes: totalNotes || 0,
                correctNotes: 0,
                closeNotes: 0,
                wrongNotes: 0,
                silentNotes: 0,
                overallAccuracy: 0,
                pitchAccuracy: 0,
                durationAccuracy: 0
            };
        },

        resetPlayback: (state) => {
            state.isPlaying = false;
            state.currentTime = 0;
            state.currentNoteIndex = -1;
            state.expectedNote = null;
            state.detectedPitch = null;
            state.noteStartTime = null;
            state.currentNoteResult = null;
        },

        // ========== Mode Management ==========
        setPlayMode: (state, action) => {
            state.playMode = action.payload; // 'wait' | 'flow'
        },

        togglePlayMode: (state) => {
            state.playMode = state.playMode === 'wait' ? 'flow' : 'wait';
        },

        // ========== Note Tracking ==========
        setCurrentNoteIndex: (state, action) => {
            state.currentNoteIndex = action.payload;
            state.noteStartTime = null; // Reset when moving to new note
            state.currentNoteResult = null;
        },

        advanceToNextNote: (state) => {
            if (state.currentNoteIndex < state.totalNotes - 1) {
                state.currentNoteIndex += 1;
                state.noteStartTime = null;
                state.currentNoteResult = null;
            }
        },

        setExpectedNote: (state, action) => {
            state.expectedNote = action.payload;
        },

        setNoteStartTime: (state, action) => {
            state.noteStartTime = action.payload;
        },

        // ========== Pitch Detection ==========
        updateDetectedPitch: (state, action) => {
            state.detectedPitch = action.payload;
        },

        // ========== Note Validation ==========
        setCurrentNoteResult: (state, action) => {
            state.currentNoteResult = action.payload;
        },

        addNoteResult: (state, action) => {
            const result = action.payload;

            // Add to results array
            state.noteResults.push(result);

            // Update statistics
            switch (result.result) {
                case 'correct':
                    state.sessionStats.correctNotes++;
                    break;
                case 'close':
                    state.sessionStats.closeNotes++;
                    break;
                case 'wrong':
                    state.sessionStats.wrongNotes++;
                    break;
                case 'silent':
                    state.sessionStats.silentNotes++;
                    break;
            }

            // Recalculate averages
            const totalResults = state.noteResults.length;
            const totalAccuracy = state.noteResults.reduce((sum, r) => sum + (r.accuracy || 0), 0);
            const totalPitchAcc = state.noteResults.reduce((sum, r) => sum + (r.pitchAccuracy || 0), 0);
            const totalDurationAcc = state.noteResults.reduce((sum, r) => sum + (r.durationAccuracy || 0), 0);

            state.sessionStats.overallAccuracy = Math.round(totalAccuracy / totalResults);
            state.sessionStats.pitchAccuracy = Math.round(totalPitchAcc / totalResults);
            state.sessionStats.durationAccuracy = Math.round(totalDurationAcc / totalResults);
        },

        updateNoteResult: (state, action) => {
            const { index, result } = action.payload;

            // Find and update existing result
            const existingIndex = state.noteResults.findIndex(r => r.index === index);

            if (existingIndex >= 0) {
                // Update existing
                const oldResult = state.noteResults[existingIndex].result;
                state.noteResults[existingIndex] = result;

                // Update stats (remove old, add new)
                if (oldResult === 'correct') state.sessionStats.correctNotes--;
                else if (oldResult === 'close') state.sessionStats.closeNotes--;
                else if (oldResult === 'wrong') state.sessionStats.wrongNotes--;
                else if (oldResult === 'silent') state.sessionStats.silentNotes--;

                if (result.result === 'correct') state.sessionStats.correctNotes++;
                else if (result.result === 'close') state.sessionStats.closeNotes++;
                else if (result.result === 'wrong') state.sessionStats.wrongNotes++;
                else if (result.result === 'silent') state.sessionStats.silentNotes++;

                // Recalculate averages
                const totalResults = state.noteResults.length;
                const totalAccuracy = state.noteResults.reduce((sum, r) => sum + (r.accuracy || 0), 0);
                const totalPitchAcc = state.noteResults.reduce((sum, r) => sum + (r.pitchAccuracy || 0), 0);
                const totalDurationAcc = state.noteResults.reduce((sum, r) => sum + (r.durationAccuracy || 0), 0);

                state.sessionStats.overallAccuracy = Math.round(totalAccuracy / totalResults);
                state.sessionStats.pitchAccuracy = Math.round(totalPitchAcc / totalResults);
                state.sessionStats.durationAccuracy = Math.round(totalDurationAcc / totalResults);
            }
        },

        // ========== Recording ==========
        setRecording: (state, action) => {
            state.isRecording = action.payload;
            if (action.payload) {
                state.recordingStartTime = state.currentTime;
            } else {
                state.recordingStartTime = null;
            }
        },
    },
});

export const {
    // Basic playback
    setPlaying,
    updateCurrentTime,
    setDuration,
    setTempo,
    seekTo,

    // Session
    initializePlayback,
    resetPlayback,

    // Mode
    setPlayMode,
    togglePlayMode,

    // Note tracking
    setCurrentNoteIndex,
    advanceToNextNote,
    setExpectedNote,
    setNoteStartTime,

    // Pitch detection
    updateDetectedPitch,

    // Validation
    setCurrentNoteResult,
    addNoteResult,
    updateNoteResult,

    // Recording
    setRecording,
} = playbackSlice.actions;

export default playbackSlice.reducer;

// ========== Selectors ==========

export const selectIsPlaying = (state) => state.playback.isPlaying;
export const selectCurrentTime = (state) => state.playback.currentTime;
export const selectDuration = (state) => state.playback.duration;
export const selectTempo = (state) => state.playback.tempo;

export const selectPlayMode = (state) => state.playback.playMode;
export const selectCurrentNoteIndex = (state) => state.playback.currentNoteIndex;
export const selectExpectedNote = (state) => state.playback.expectedNote;
export const selectDetectedPitch = (state) => state.playback.detectedPitch;
export const selectNoteStartTime = (state) => state.playback.noteStartTime;
export const selectCurrentNoteResult = (state) => state.playback.currentNoteResult;

export const selectNoteResults = (state) => state.playback.noteResults;
export const selectSessionStats = (state) => state.playback.sessionStats;

export const selectIsRecording = (state) => state.playback.isRecording;

export const selectPlaybackState = (state) => state.playback;