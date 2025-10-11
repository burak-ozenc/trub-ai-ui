import React from 'react';
import { MessageSquare } from 'lucide-react';

const FeedbackDisplay = ({ feedback }) => {
    if (!feedback) return null;

    return (
        <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Teacher Feedback
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {feedback}
                </pre>
            </div>
        </div>
    );
};

export default FeedbackDisplay;