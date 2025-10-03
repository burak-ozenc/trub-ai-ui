import React from 'react';

const GuidanceInput = ({ value, onChange, disabled }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question or Guidance
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="What would you like feedback on? (e.g., 'How is my breathing?', 'Is my tone quality good?')"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={disabled}
            />
        </div>
    );
};

export default GuidanceInput;