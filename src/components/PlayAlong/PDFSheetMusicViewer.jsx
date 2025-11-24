import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const PDFSheetMusicViewer = ({ songId, difficulty }) => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSheetMusic();
    }, [songId, difficulty]);

    const loadSheetMusic = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch PDF from backend
            const pdfBlob = await api.getSongSheetMusic(songId, difficulty);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
        } catch (err) {
            console.error('Error loading sheet music:', err);
            setError('Failed to load sheet music. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

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
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-500">{error}</p>
                <button
                    onClick={loadSheetMusic}
                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    style={{ backgroundColor: '#FF5500' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="sheet-music-pdf-viewer">
            {pdfUrl ? (
                <iframe
                    src={pdfUrl}
                    className="w-full border-0 rounded-lg"
                    style={{ height: '600px' }}
                    title="Sheet Music"
                />
            ) : (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-600">No sheet music available</p>
                </div>
            )}
        </div>
    );
};

export default PDFSheetMusicViewer;