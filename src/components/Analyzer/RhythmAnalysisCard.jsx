import React from 'react';
import { Clock } from 'lucide-react';

const RhythmAnalysisCard = ({ rhythmData }) => {
    if (!rhythmData) return null;

    return (
        <div className="mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Rhythm & Timing
            </h4>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <span className="text-xs text-purple-600 font-medium">Tempo</span>
                        <p className="text-lg font-bold text-purple-900">{rhythmData.tempo} BPM</p>
                    </div>
                    <div>
                        <span className="text-xs text-purple-600 font-medium">Beat Strength</span>
                        <p className="text-lg font-bold text-purple-900">
                            {(rhythmData.beat_strength * 100).toFixed(0)}%
                        </p>
                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-xs text-purple-600 font-medium">Timing Consistency</span>
                    <div className="mt-1 bg-white rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-purple-600 transition-all"
                            style={{ width: `${(1 - rhythmData.timing_deviation) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <p className="text-sm text-purple-800 mt-2">{rhythmData.consistency}</p>
                <p className="text-xs text-purple-700 mt-2 italic">{rhythmData.recommendations}</p>
            </div>
        </div>
    );
};

export default RhythmAnalysisCard;