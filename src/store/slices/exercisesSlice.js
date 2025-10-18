import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {api} from '../../services/api';

// Async thunks
export const fetchExercises = createAsyncThunk(
    'exercises/fetchExercises',
    async ({technique, difficulty} = {}) => {
        return await api.getExercises(technique, difficulty);
    }
);

export const fetchRecommendedExercises = createAsyncThunk(
    'exercises/fetchRecommended',
    async (technique) => {
        return await api.getRecommendedExercises(technique);
    }
);

export const fetchExerciseById = createAsyncThunk(
    'exercises/fetchById',
    async (exerciseId) => {
        return await api.getExercise(exerciseId);
    }
);

const exercisesSlice = createSlice({
    name: 'exercises',
    initialState: {
        exercises: [],
        currentExercise: null,
        loading: false,
        error: null,
        hasFetched: false,
    },
    reducers: {
        setCurrentExercise: (state, action) => {
            state.currentExercise = action.payload;
        },
        clearCurrentExercise: (state) => {
            state.currentExercise = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch exercises
            .addCase(fetchExercises.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExercises.fulfilled, (state, action) => {
                state.loading = false;
                state.exercises = action.payload;
                state.hasFetched = true;
            })
            .addCase(fetchExercises.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch recommended
            .addCase(fetchRecommendedExercises.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecommendedExercises.fulfilled, (state, action) => {
                state.loading = false;
                state.exercises = action.payload;
                state.hasFetched = true;
            })
            .addCase(fetchRecommendedExercises.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Fetch by ID
            .addCase(fetchExerciseById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExerciseById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentExercise = action.payload;
            })
            .addCase(fetchExerciseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const {setCurrentExercise, clearCurrentExercise} = exercisesSlice.actions;
export default exercisesSlice.reducer;