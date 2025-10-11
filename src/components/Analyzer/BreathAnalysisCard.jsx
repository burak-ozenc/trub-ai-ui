import React from 'react';
import { Wind } from 'lucide-react';

const BreathAnalysisCard = ({ breathData }) => {
    if (!breathData) return null;

    return (
        <div className="mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4" />
                Breath Control
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <span className="text-xs text-blue-600 font-medium">Breath Count</span>
                        <p className="text-lg font-bold text-blue-900">{breathData.breath_count}</p>
                    </div>
                    <div>
                        <span className="text-xs text-blue-600 font-medium">Avg Length</span>
                        <p className="text-lg font-bold text-blue-900">{breathData.average_breath_length}s</p>
                    </div>
                </div>
                <p className="text-sm text-blue-800 mt-2">{breathData.breath_consistency}</p>
            </div>
        </div>
    );
};

export default BreathAnalysisCard;