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
        <div className="w-full max-w-2xl mx-auto">
            {/* Title */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-semibold text-gray-800">
                    What do you want to work on today?
                </h2>
            </div>

            {/* Input */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Example: How is my breathing? Is my tone quality improving?"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                rows={2}
            />

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className="text-sm text-gray-500 mr-2 self-center">Quick select:</span>
                {quickChips.map((chip) => (
                    <button
                        key={chip}
                        onClick={() => handleChipClick(chip)}
                        disabled={disabled}
                        className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Validation Message */}
            {!value.trim() && (
                <p className="text-center text-sm text-orange-600 mt-3 font-medium">
                    ⚠️ Please describe your practice goal before recording
                </p>
            )}
        </div>
    );
};

export default GuidancePrompt;