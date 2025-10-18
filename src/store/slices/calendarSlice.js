import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Async thunks
export const fetchCalendarEntries = createAsyncThunk(
    'calendar/fetchEntries',
    async ({ startDate, endDate }) => {
        return await api.getCalendarEntries(startDate, endDate);
    }
);

export const fetchEntriesByDate = createAsyncThunk(
    'calendar/fetchByDate',
    async (date) => {
        return await api.getEntriesByDate(date);
    }
);

export const fetchUpcomingPractices = createAsyncThunk(
    'calendar/fetchUpcoming',
    async (limit = 10) => {
        return await api.getUpcomingPractices(limit);
    }
);

export const createEntry = createAsyncThunk(
    'calendar/createEntry',
    async (entryData) => {
        return await api.createCalendarEntry(entryData);
    }
);

export const updateEntry = createAsyncThunk(
    'calendar/updateEntry',
    async ({ entryId, updateData }) => {
        return await api.updateCalendarEntry(entryId, updateData);
    }
);

export const completeEntry = createAsyncThunk(
    'calendar/completeEntry',
    async ({ entryId, practiceSessionId }) => {
        console.log('practiceSessionId',practiceSessionId)
        return await api.completeCalendarEntry(entryId, practiceSessionId);
    }
);

export const deleteEntry = createAsyncThunk(
    'calendar/deleteEntry',
    async (entryId) => {
        await api.deleteCalendarEntry(entryId);
        return entryId;
    }
);

const calendarSlice = createSlice({
    name: 'calendar',
    initialState: {
        entries: [],
        selectedDateEntries: [],
        upcomingPractices: [],
        selectedDate: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedDate: (state, action) => {
            // Convert Date to ISO string for serialization
            state.selectedDate = action.payload instanceof Date
                ? action.payload.toISOString()
                : action.payload;
        },
        clearSelectedDate: (state) => {
            state.selectedDate = null;
            state.selectedDateEntries = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch entries
            .addCase(fetchCalendarEntries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalendarEntries.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload;
            })
            .addCase(fetchCalendarEntries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch by date
            .addCase(fetchEntriesByDate.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEntriesByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDateEntries = action.payload;
                // Don't store the date here, only in setSelectedDate reducer
            })
            .addCase(fetchEntriesByDate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch upcoming
            .addCase(fetchUpcomingPractices.fulfilled, (state, action) => {
                state.upcomingPractices = action.payload;
            })
            // Create entry
            .addCase(createEntry.fulfilled, (state, action) => {
                state.entries.push(action.payload);
            })
            // Update entry
            .addCase(updateEntry.fulfilled, (state, action) => {
                const index = state.entries.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
            })
            // Complete entry
            .addCase(completeEntry.fulfilled, (state, action) => {
                const index = state.entries.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.entries[index] = action.payload;
                }
            })
            // Delete entry
            .addCase(deleteEntry.fulfilled, (state, action) => {
                state.entries = state.entries.filter(e => e.id !== action.payload);
                state.selectedDateEntries = state.selectedDateEntries.filter(e => e.id !== action.payload);
            });
    },
});

export const { setSelectedDate, clearSelectedDate } = calendarSlice.actions;
export default calendarSlice.reducer;