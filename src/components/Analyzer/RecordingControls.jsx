import React, { useRef } from 'react';
import { Mic, MicOff, Upload } from 'lucide-react';

const RecordingControls = ({
                               isRecording,
                               isAnalyzing,
                               onStartRecording,
                               onStopRecording,
                               onFileUpload
                           }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="flex gap-3 mb-4">
            <button
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Upload className="w-4 h-4" />
                Upload File
            </button>
        </div>
    );
};

export default RecordingControls;