import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deleteRecordingFromDb, setCurrentRecording, fetchRecordings } from '../../store/slices/recordingsSlice';
import { api } from '../../services/api';
import { History, Trash2, Play, Pause, Clock, Loader2, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';

const RecordingHistory = ({ isCollapsed, onToggle }) => {
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
                // eslint-disable-next-line
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

    return (
        <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-all duration-300 z-30 flex flex-col ${
            isCollapsed ? 'w-0' : 'w-96'
        }`}>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -left-10 top-20 bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-l-lg transition-colors shadow-lg"
            >
                {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Content */}
            {!isCollapsed && (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-teal-600" />
                            Recording History
                            <span className="text-sm font-normal text-gray-500">({recordings.length})</span>
                        </h2>
                    </div>

                    {/* Loading State */}
                    {loading && recordings.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                            <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                Error: {error}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && recordings.length === 0 && (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    No recordings yet
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recordings List */}
                    {recordings.length > 0 && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {recordings.map((recording) => (
                                <div
                                    key={recording.id}
                                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => handleView(recording)}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Volume2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                                <span className="font-medium text-gray-900 text-sm truncate">
                                                    {recording.filename || `Recording ${recording.id}`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                                {recording.guidance}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(recording.created_at || recording.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {/* Play/Pause Button */}
                                            {recording.audio_file_path && (
                                                <button
                                                    onClick={(e) => handlePlay(recording, e)}
                                                    disabled={loadingAudio === recording.id}
                                                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-md transition-colors disabled:opacity-50"
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
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordingHistory;