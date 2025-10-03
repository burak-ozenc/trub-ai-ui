import React from 'react';
import { BarChart3 } from 'lucide-react';
import FeedbackDisplay from './FeedbackDisplay';
import TechnicalAnalysis from './TechnicalAnalysis';
import Recommendations from './Recommendations';

const AnalysisResults = ({ analysisResult }) => {
    if (!analysisResult) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analysis Results
            </h2>

            <FeedbackDisplay feedback={analysisResult.feedback} />

            <TechnicalAnalysis technicalData={analysisResult.technical_analysis} />

            <Recommendations recommendations={analysisResult.recommendations} />
        </div>
    );
};

export default AnalysisResults;