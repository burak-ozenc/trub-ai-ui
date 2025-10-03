import React from 'react';
import BreathAnalysisCard from './BreathAnalysisCard';
import ToneAnalysisCard from './ToneAnalysisCard';
import RhythmAnalysisCard from './RhythmAnalysisCard';

const TechnicalAnalysis = ({ technicalData }) => {
    if (!technicalData || Object.keys(technicalData).length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Technical Analysis</h3>
            <div className="space-y-4">
                {technicalData.breath_analysis && (
                    <BreathAnalysisCard breathData={technicalData.breath_analysis} />
                )}
                {technicalData.tone_analysis && (
                    <ToneAnalysisCard toneData={technicalData.tone_analysis} />
                )}
                {technicalData.rhythm_timing && (
                    <RhythmAnalysisCard rhythmData={technicalData.rhythm_timing} />
                )}
            </div>
        </div>
    );
};

export default TechnicalAnalysis;