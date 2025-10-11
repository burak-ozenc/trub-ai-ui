import { configureStore } from '@reduxjs/toolkit';
import recordingsReducer from './slices/recordingsSlice';
import settingsReducer from './slices/settingsSlice';

// Load persisted state from localStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('trumpetAnalyzerState');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Error loading state:', err);
        return undefined;
    }
};

// Save state to localStorage
const saveState = (state) => {
    try {
        // Don't save audioBlobs to localStorage (too large)
        const stateToPersist = {
            settings: state.settings,
            recordings: {
                ...state.recordings,
                recordings: state.recordings.recordings.map(rec => ({
                    ...rec,
                    audioBlob: null // Don't persist audio blobs
                }))
            }
        };
        const serializedState = JSON.stringify(stateToPersist);
        localStorage.setItem('trumpetAnalyzerState', serializedState);
    } catch (err) {
        console.error('Error saving state:', err);
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        recordings: recordingsReducer,
        settings: settingsReducer,
        // Future slices:
        // chat: chatReducer,
        // analysis: analysisReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['recordings/addRecording'],
                ignoredPaths: ['recordings.recordings', 'recordings.currentRecording']
            }
        })
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
    saveState(store.getState());
});

export default store;