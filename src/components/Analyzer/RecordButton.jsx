import React from 'react';
import { Mic, Square } from 'lucide-react';

const RecordButton = ({ isRecording, isAnalyzing, onToggle, disabled }) => {
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Record Button - Smaller */}
            <button
                onClick={onToggle}
                disabled={disabled || isAnalyzing}
                className={`relative w-32 h-32 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isRecording
                        ? 'bg-red-500 shadow-xl shadow-red-500/50 animate-pulse'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/50'
                }`}
                style={{
                    boxShadow: isRecording
                        ? '0 0 40px rgba(239, 68, 68, 0.6)'
                        : '0 0 30px rgba(255, 85, 0, 0.4)'
                }}
            >
                <div className="flex flex-col items-center justify-center h-full text-white">
                    {isRecording ? (
                        <>
                            <Square className="w-12 h-12 mb-1" fill="white" />
                            <span className="text-base font-semibold">Stop</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-12 h-12 mb-1" />
                            <span className="text-base font-semibold">Record</span>
                        </>
                    )}
                </div>

                {/* Pulse animation ring for recording */}
                {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
                )}
            </button>

            {/* Status Text */}
            <div className="text-center">
                {isRecording && (
                    <p className="text-red-600 font-medium animate-pulse">
                        ● Recording...
                    </p>
                )}
                {isAnalyzing && (
                    <p className="text-orange-600 font-medium">
                        Analyzing your performance...
                    </p>
                )}
                {!isRecording && !isAnalyzing && disabled && (
                    <p className="text-gray-500 text-sm">
                        Enter your practice goal to start
                    </p>
                )}
            </div>
        </div>
    );
};

export default RecordButton;