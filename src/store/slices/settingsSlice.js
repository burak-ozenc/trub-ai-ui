import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // LLM Settings
    llmModel: 'deepseek-r1:7b',
    availableModels: [
        { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B', description: 'Fast, good for quick feedback' },
        { id: 'llama2:13b', name: 'Llama 2 13B', description: 'Balanced performance' },
        { id: 'mistral:7b', name: 'Mistral 7B', description: 'High quality responses' },
    ],

    // Audio Settings
    audioQuality: 'high', // low, medium, high
    maxRecordingDuration: 300, // seconds (5 minutes)

    // UI Settings
    autoPlayAnalysis: false,
    showDetailedMetrics: true,
    theme: 'light', // light, dark

    // Analysis Settings
    defaultAnalysisType: 'full', // full, breath, tone, rhythm
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setLlmModel: (state, action) => {
            state.llmModel = action.payload;
        },

        setAudioQuality: (state, action) => {
            state.audioQuality = action.payload;
        },

        setMaxRecordingDuration: (state, action) => {
            state.maxRecordingDuration = action.payload;
        },

        setAutoPlayAnalysis: (state, action) => {
            state.autoPlayAnalysis = action.payload;
        },

        setShowDetailedMetrics: (state, action) => {
            state.showDetailedMetrics = action.payload;
        },

        setTheme: (state, action) => {
            state.theme = action.payload;
        },

        setDefaultAnalysisType: (state, action) => {
            state.defaultAnalysisType = action.payload;
        },

        resetSettings: () => initialState,
    }
});

export const {
    setLlmModel,
    setAudioQuality,
    setMaxRecordingDuration,
    setAutoPlayAnalysis,
    setShowDetailedMetrics,
    setTheme,
    setDefaultAnalysisType,
    resetSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;