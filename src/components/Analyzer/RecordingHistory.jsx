import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deleteRecordingFromDb, setCurrentRecording, fetchRecordings } from '../../store/slices/recordingsSlice';
import { api } from '../../services/api';
import { History, Trash2, Play, Clock, Loader2, Pause } from 'lucide-react';

const RecordingHistory = () => {
    const dispatch = useAppDispatch();
    const { recordings, loading, error } = useAppSelector(state => state.recordings);
    const [playingId, setPlayingId] = useState(null);
    const [loadingAudio, setLoadingAudio] = useState(null);
    const audioRef = useRef(new Audio());

    // Fetch recordings on mount
    useEffect(() => {
        dispatch(fetchRecordings());
    }, [dispatch]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const handlePlay = async (recording, e) => {
        e.stopPropagation();

        // If already playing this recording, pause it
        if (playingId === recording.id) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        // If playing another recording, stop it first
        if (playingId !== null) {
            audioRef.current.pause();
        }

        try {
            setLoadingAudio(recording.id);

            // Fetch audio from backend
            const audioBlob = await api.getRecordingAudio(recording.id);
            const audioUrl = URL.createObjectURL(audioBlob);

            // Set up audio
            audioRef.current.src = audioUrl;
            audioRef.current.onended = () => {
                setPlayingId(null);
                URL.revokeObjectURL(audioUrl);
            };

            // Play audio
            await audioRef.current.play();
            setPlayingId(recording.id);
        } catch (err) {
            console.error('Error playing audio:', err);
            alert('Failed to play audio: ' + err.message);
        } finally {
            setLoadingAudio(null);
        }
    };

    const handleView = (recording) => {
        dispatch(setCurrentRecording(recording));
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();

        // Stop audio if playing
        if (playingId === id) {
            audioRef.current.pause();
            setPlayingId(null);
        }

        if (window.confirm('Delete this recording? This cannot be undone.')) {
            await dispatch(deleteRecordingFromDb(id));
        }
    };

    if (loading && recordings.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recording History
                </h2>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading recordings...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recording History
                </h2>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    Error loading recordings: {error}
                </div>
            </div>
        );
    }

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
                                        {recording.filename || recording.fileName || `Recording ${recording.id}`}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {recording.guidance}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(recording.created_at || recording.timestamp).toLocaleString()}
                                    </div>
                                    {recording.analysis_type && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                            {recording.analysis_type}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                {/* Play/Pause Button */}
                                {recording.audio_file_path && (
                                    <button
                                        onClick={(e) => handlePlay(recording, e)}
                                        disabled={loadingAudio === recording.id}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                        title={playingId === recording.id ? "Pause" : "Play"}
                                    >
                                        {loadingAudio === recording.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : playingId === recording.id ? (
                                            <Pause className="w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                )}

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDelete(recording.id, e)}
                                    disabled={loading}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                    title="Delete recording"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecordingHistory;