import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const MIDISheetMusicViewer = ({ songId, difficulty }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [midiUrl, setMidiUrl] = useState(null);

    useEffect(() => {
        loadSheetMusic();
    }, [songId, difficulty]);

    const loadSheetMusic = async () => {
        setLoading(true);
        setError(null);

        try {
            // Since PDFs don't exist, fetch MIDI file instead
            const midiBlob = await api.getSongMidi(songId, difficulty);
            const url = URL.createObjectURL(midiBlob);
            setMidiUrl(url);
        } catch (err) {
            console.error('Error loading sheet music:', err);
            setError('Sheet music not available for this song.');
        } finally {
            setLoading(false);
        }
    };

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (midiUrl) {
                URL.revokeObjectURL(midiUrl);
            }
        };
    }, [midiUrl]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">🎼</div>
                <p className="text-gray-600">Loading sheet music...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <p className="text-sm text-gray-500">
                    Follow the backing track and play along!
                </p>
            </div>
        );
    }

    return (
        <div className="sheet-music-viewer bg-gray-50 rounded-lg p-8">
            {/* Simple notation display */}
            <div className="text-center">
                <div className="text-6xl mb-6">🎼</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Sheet Music Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                    For now, play along with the backing track and use your ear!
                </p>

                {/* Show difficulty info */}
                <div className="inline-block bg-white rounded-lg shadow p-6">
                    <h4 className="font-bold mb-3" style={{ color: '#FF5500' }}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                    </h4>

                    {difficulty === 'beginner' && (
                        <ul className="text-sm text-left text-gray-700 space-y-2">
                            <li>• Range: C4 to C5 (middle C to high C)</li>
                            <li>• Slower tempo (80% of original)</li>
                            <li>• Simplified rhythm</li>
                            <li>• No fast passages</li>
                        </ul>
                    )}

                    {difficulty === 'intermediate' && (
                        <ul className="text-sm text-left text-gray-700 space-y-2">
                            <li>• Range: G3 to F5</li>
                            <li>• Original tempo</li>
                            <li>• Some complex rhythms</li>
                            <li>• Moderate difficulty</li>
                        </ul>
                    )}

                    {difficulty === 'advanced' && (
                        <ul className="text-sm text-left text-gray-700 space-y-2">
                            <li>• Full range: E3 to C6</li>
                            <li>• Original tempo or faster</li>
                            <li>• All original rhythms</li>
                            <li>• Full difficulty</li>
                        </ul>
                    )}
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    💡 Tip: Use the tuner to check your pitch and the metronome for timing
                </div>
            </div>
        </div>
    );
};

export default MIDISheetMusicViewer;