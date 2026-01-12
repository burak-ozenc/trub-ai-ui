import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRecommendedExercises } from '../../store/slices/exercisesSlice';
import { createEntry, updateEntry } from '../../store/slices/calendarSlice';
import { X, Plus, Edit } from 'lucide-react';

const AddPracticeModal = ({ date, existingEntry, onClose }) => {
    const dispatch = useAppDispatch();
    const { exercises } = useAppSelector((state) => state.exercises);

    const [selectedExercise, setSelectedExercise] = useState(existingEntry?.exercise_id || null);
    const [time, setTime] = useState(existingEntry?.scheduled_time || '');
    const [duration, setDuration] = useState(existingEntry?.duration_minutes || 30);
    const [notes, setNotes] = useState(existingEntry?.notes || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchRecommendedExercises());
        }
    }, [dispatch, exercises.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExercise) return;

        setLoading(true);
        try {
            const entryData = {
                exercise_id: selectedExercise,
                scheduled_date: date.toISOString(),
                scheduled_time: time || null,
                duration_minutes: duration,
                notes: notes || null,
            };

            if (existingEntry) {
                await dispatch(updateEntry({
                    entryId: existingEntry.id,
                    updateData: entryData
                })).unwrap();
            } else {
                await dispatch(createEntry(entryData)).unwrap();
            }

            onClose();
        } catch (error) {
            console.error('Error saving practice:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {existingEntry ? (
                            <Edit className="w-6 h-6" />
                        ) : (
                            <Plus className="w-6 h-6" />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">
                                {existingEntry ? 'Edit Practice' : 'Schedule Practice'}
                            </h2>
                            <p className="text-teal-100 text-sm">{formatDate(date)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-teal-400 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Exercise Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Choose Exercise *
                        </label>
                        <select
                            value={selectedExercise || ''}
                            onChange={(e) => setSelectedExercise(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                            required
                        >
                            <option value="">Select an exercise...</option>
                            {exercises.map((exercise) => (
                                <option key={exercise.id} value={exercise.id}>
                                    {exercise.title} ({exercise.technique} · {exercise.difficulty})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time & Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Time (optional)
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                min="5"
                                max="180"
                                step="5"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            placeholder="Any specific goals or reminders..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedExercise}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                                loading || !selectedExercise
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                            }`}
                        >
                            {loading ? 'Saving...' : existingEntry ? 'Update Practice' : 'Schedule Practice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPracticeModal;