import React from 'react';
import { Clock, Target, BookOpen } from 'lucide-react';

const ExerciseCard = ({ exercise, onSelect, isSelected }) => {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700 border-green-300';
            case 'intermediate': return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'advanced': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

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
        <div
            onClick={() => onSelect(exercise)}
            className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                    ? 'border-orange-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTechniqueIcon(exercise.technique)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{exercise.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                </span>
            </div>

            {/* Description */}
            {exercise.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exercise.description}
                </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                {exercise.duration_minutes && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration_minutes} min</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span className="capitalize">{exercise.technique}</span>
                </div>
                {exercise.sheet_music_url && (
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Sheet music</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseCard;