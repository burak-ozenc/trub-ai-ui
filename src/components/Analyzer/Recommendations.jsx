import React from 'react';
import { Lightbulb } from 'lucide-react';

const Recommendations = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Practice Recommendations
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Recommendations;