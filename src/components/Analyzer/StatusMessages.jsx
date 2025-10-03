import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const StatusMessages = ({ isAnalyzing, error }) => {
    if (!isAnalyzing && !error) return null;

    return (
        <>
            {isAnalyzing && (
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing your performance...
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </>
    );
};

export default StatusMessages;