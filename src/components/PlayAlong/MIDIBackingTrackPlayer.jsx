import React, { useState, useEffect, useRef } from 'react';

/**
 * MIDI Player Component
 *
 * Plays MIDI files using Web MIDI API or falls back to simple audio element
 * For MVP: Downloads MIDI and provides controls
 */
const MIDIBackingTrackPlayer = ({ songId, onTimeUpdate, onLoadedMetadata, onEnded }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [tempo, setTempo] = useState(100);
    const [midiUrl, setMidiUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // For now, we'll use a simple interval to simulate playback
    // In production, use MIDI.js or Tone.js
    const intervalRef = useRef(null);

    useEffect(() => {
        loadMidiFile();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [songId]);

    const loadMidiFile = async () => {
        setLoading(true);
        setError(null);

        try {
            // MIDI files are saved as backing tracks
            const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/songs/${songId}/backing-track`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load backing track');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setMidiUrl(url);

            // Set a default duration (we'll get this from metadata later)
            setDuration(180); // 3 minutes default

            if (onLoadedMetadata) {
                onLoadedMetadata({ duration: 180 });
            }

        } catch (err) {
            console.error('Error loading MIDI:', err);
            setError('Could not load backing track');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            // Pause
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setIsPlaying(false);
        } else {
            // Play - simulate with interval
            intervalRef.current = setInterval(() => {
                setCurrentTime(prev => {
                    const newTime = prev + (1 * tempo / 100);

                    if (onTimeUpdate) {
                        onTimeUpdate({ currentTime: newTime });
                    }

                    if (newTime >= duration) {
                        clearInterval(intervalRef.current);
                        setIsPlaying(false);
                        if (onEnded) {
                            onEnded();
                        }
                        return 0;
                    }

                    return newTime;
                });
            }, 1000);
            setIsPlaying(true);
        }
    };

    const handleSeek = (newTime) => {
        setCurrentTime(newTime);
        if (onTimeUpdate) {
            onTimeUpdate({ currentTime: newTime });
        }
    };

    const handleTempoChange = (newTempo) => {
        setTempo(newTempo);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600">Loading backing track...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
                <button
                    onClick={loadMidiFile}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="backing-track-player">
            {/* Play/Pause Button */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={handlePlayPause}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-all"
                    style={{ backgroundColor: '#FF5500' }}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>

                <div className="flex-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={(currentTime / duration) * 100 || 0}
                        onChange={(e) => handleSeek((e.target.value / 100) * duration)}
                        className="w-full"
                        style={{ accentColor: '#FF5500' }}
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Tempo Control */}
            <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 min-w-24">
                    Tempo: {tempo}%
                </label>
                <input
                    type="range"
                    min="50"
                    max="150"
                    value={tempo}
                    onChange={(e) => handleTempoChange(parseInt(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: '#14b8a6' }}
                />
                <button
                    onClick={() => handleTempoChange(100)}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                >
                    Reset
                </button>
            </div>

            {/* Download MIDI option */}
            {midiUrl && (
                <div className="mt-4 text-center">
                    <a
                        href={midiUrl}
                        download={`song-${songId}-backing.mid`}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                        📥 Download MIDI backing track
                    </a>
                </div>
            )}

            {/* Note about playback */}
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
                <p>
                    💡 <strong>Note:</strong> The backing track timer is running.
                    Play along with your trumpet! MIDI audio playback will be added in the next update.
                </p>
            </div>
        </div>
    );
};

export default MIDIBackingTrackPlayer;