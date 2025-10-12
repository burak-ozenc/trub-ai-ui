import React from 'react';
import { Target } from 'lucide-react';

const GuidancePrompt = ({ value, onChange, disabled }) => {
    const quickChips = [
        'Breathing',
        'Tone Quality',
        'High Notes',
        'Articulation',
        'Rhythm'
    ];

    const handleChipClick = (chip) => {
        onChange(`How is my ${chip.toLowerCase()}?`);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Title - Compact */}
            <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                    Practice Goal
                </h3>
            </div>

            {/* Input - More compact */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="What do you want to work on? (e.g., breathing, tone quality...)"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                rows={2}
            />

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {quickChips.map((chip) => (
                    <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        disabled={disabled}
                        className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Validation Message */}
            {!value.trim() && (
                <p className="text-center text-xs text-orange-600 mt-2 font-medium">
                    Required before recording
                </p>
            )}
        </div>
    );
};

export default GuidancePrompt;