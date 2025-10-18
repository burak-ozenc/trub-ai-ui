import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEntriesByDate, completeEntry, deleteEntry } from '../../store/slices/calendarSlice';
import { X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import CalendarEntry from './CalendarEntry';

const DayView = ({ date, onClose, onAddPractice, onEditEntry, onStartPractice }) => {
    const dispatch = useAppDispatch();
    const { selectedDateEntries, loading } = useAppSelector((state) => state.calendar);

    useEffect(() => {
        if (date) {
            dispatch(fetchEntriesByDate(date));
        }
    }, [date, dispatch]);

    const handleComplete = (entryId) => {
        dispatch(completeEntry({ entryId, practiceSessionId: null }));
    };

    const handleDelete = (entryId) => {
        if (window.confirm('Delete this practice session?')) {
            dispatch(deleteEntry(entryId));
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-6 h-6" />
                        <div>
                            <h2 className="text-2xl font-bold">{formatDate(date)}</h2>
                            <p className="text-orange-100 text-sm">
                                {selectedDateEntries.length} practice{selectedDateEntries.length !== 1 ? 's' : ''} scheduled
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-orange-400 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : selectedDateEntries.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">No practices scheduled for this day</p>
                            <button
                                onClick={() => onAddPractice(date)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Add Practice
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateEntries.map((entry) => (
                                <CalendarEntry
                                    key={entry.id}
                                    entry={entry}
                                    onComplete={handleComplete}
                                    onEdit={onEditEntry}
                                    onDelete={handleDelete}
                                    onStartPractice={onStartPractice}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedDateEntries.length > 0 && (
                    <div className="border-t p-4 bg-gray-50">
                        <button
                            onClick={() => onAddPractice(date)}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Another Practice
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayView;