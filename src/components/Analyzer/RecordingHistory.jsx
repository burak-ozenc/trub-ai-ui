import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deleteRecording, setCurrentRecording, clearAllRecordings } from '../../store/slices/recordingsSlice';
import { History, Trash2, Play, Clock } from 'lucide-react';

const RecordingHistory = () => {
    const dispatch = useAppDispatch();
    const recordings = useAppSelector(state => state.recordings.recordings);

    const handleView = (recording) => {
        dispatch(setCurrentRecording(recording));
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this recording?')) {
            dispatch(deleteRecording(id));
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Delete all recordings? This cannot be undone.')) {
            dispatch(clearAllRecordings());
        }
    };

    if (recordings.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recording History
                </h2>
                <p className="text-gray-500 text-center py-8">
                    No recordings yet. Start recording to build your history!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recording History ({recordings.length})
                </h2>
                <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {recordings.map((recording) => (
                    <div
                        key={recording.id}
                        className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleView(recording)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Play className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                        {recording.fileName}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {recording.guidance}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(recording.timestamp).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={(e) => handleDelete(recording.id, e)}
                                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete recording"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecordingHistory;