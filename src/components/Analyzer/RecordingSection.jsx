import React from 'react';
import { Mic } from 'lucide-react';
import GuidanceInput from './GuidanceInput';
import RecordingControls from './RecordingControls';
import StatusMessages from './StatusMessages';

const RecordingSection = ({
                              guidance,
                              onGuidanceChange,
                              isRecording,
                              isAnalyzing,
                              error,
                              onStartRecording,
                              onStopRecording,
                              onFileUpload
                          }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Record & Analyze
            </h2>

            <GuidanceInput
                value={guidance}
                onChange={onGuidanceChange}
                disabled={isAnalyzing}
            />

            <RecordingControls
                isRecording={isRecording}
                isAnalyzing={isAnalyzing}
                onStartRecording={onStartRecording}
                onStopRecording={onStopRecording}
                onFileUpload={onFileUpload}
            />

            <StatusMessages
                isAnalyzing={isAnalyzing}
                error={error}
            />
        </div>
    );
};

export default RecordingSection;