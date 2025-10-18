import React from 'react';
import { Clock, CheckCircle, Circle, Trash2, Edit, Play } from 'lucide-react';

const CalendarEntry = ({ entry, onComplete, onEdit, onDelete, onStartPractice }) => {
    const getTechniqueIcon = (technique) => {
        const icons = {
            breathing: '🫁',
            tone: '🎵',
            rhythm: '🎶',
            articulation: '👅',
            flexibility: '🌊',
        };
        return icons[technique] || '🎺';
    };

    return (
        <div className={`bg-white rounded-xl p-4 border-2 transition-all ${
            entry.completed
                ? 'border-green-300 bg-green-50'
                : 'border-orange-200 hover:border-orange-300'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTechniqueIcon(entry.exercise?.technique)}</span>
                        <h4 className="font-semibold text-gray-900">{entry.exercise?.title}</h4>
                        {entry.completed && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                    </div>

                    {entry.scheduled_time && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>{entry.scheduled_time}</span>
                            {entry.duration_minutes && (
                                <span>· {entry.duration_minutes} min</span>
                            )}
                        </div>
                    )}

                    {entry.notes && (
                        <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!entry.completed && (
                        <>
                            {/* NEW: Start Practice Button */}
                            <button
                                onClick={() => onStartPractice(entry)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Start practice"
                            >
                                <Play className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onComplete(entry.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark complete"
                            >
                                <Circle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => onEdit(entry)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onDelete(entry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarEntry;