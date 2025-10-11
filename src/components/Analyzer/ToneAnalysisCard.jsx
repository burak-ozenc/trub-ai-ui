import React from 'react';
import { Volume2 } from 'lucide-react';

const ToneAnalysisCard = ({ toneData }) => {
    if (!toneData) return null;

    return (
        <div className="mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4" />
                Tone Quality
            </h4>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="mb-2">
                    <span className="text-xs text-green-600 font-medium">Harmonic Ratio</span>
                    <p className="text-lg font-bold text-green-900">{(toneData.harmonic_ratio * 100).toFixed(1)}%</p>
                </div>
                <p className="text-sm text-green-800">{toneData.quality_score}</p>
                <p className="text-xs text-green-700 mt-2 italic">{toneData.recommendations}</p>
            </div>
        </div>
    );
};

export default ToneAnalysisCard;