import React from 'react';
import { Play, Square, Mic, CheckCircle } from 'lucide-react';

const PracticeControls = ({
                              isRecording,
                              isAnalyzing,
                              hasRecorded,
                              onStartRecording,
                              onStopRecording,
                              onCompleteWithoutRecording,
                              disabled
                          }) => {
    return (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Practice Controls</h3>

            <div className="flex flex-col gap-3">
                {/* Recording Button */}
                {!isRecording ? (
                    <button
                        onClick={onStartRecording}
                        disabled={disabled || isAnalyzing}
                        className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all ${
                            disabled || isAnalyzing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                    >
                        <Mic className="w-5 h-5" />
                        Record Your Practice
                    </button>
                ) : (
                    <button
                        onClick={onStopRecording}
                        className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg transition-all"
                    >
                        <Square className="w-5 h-5 fill-current" />
                        Stop Recording
                    </button>
                )}

                {/* Analyzing State */}
                {isAnalyzing && (
                    <div className="text-center py-3">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mb-2"></div>
                        <p className="text-sm text-gray-600">Analyzing your performance...</p>
                    </div>
                )}

                {/* Complete Without Recording */}
                <button
                    onClick={onCompleteWithoutRecording}
                    disabled={disabled || isRecording || isAnalyzing}
                    className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all ${
                        disabled || isRecording || isAnalyzing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-300'
                    }`}
                >
                    <CheckCircle className="w-5 h-5" />
                    Complete Without Recording
                </button>

                {/* Help Text */}
                <p className="text-xs text-gray-500 text-center mt-2">
                    Record your practice to get AI feedback, or complete without recording
                </p>
            </div>
        </div>
    );
};

export default PracticeControls;