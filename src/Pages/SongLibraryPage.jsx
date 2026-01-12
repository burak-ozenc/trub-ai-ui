import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Common/Header';

const SongLibraryPage = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genreFilter, setGenreFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadSongs();
    }, [genreFilter]);

    const loadSongs = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (genreFilter !== 'all') {
                filters.genre = genreFilter;
            }
            const data = await api.getSongs(filters);
            setSongs(data.songs);
        } catch (error) {
            console.error('Error loading songs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySong = (songId, difficulty) => {
        navigate(`/play-along/${songId}/${difficulty}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-teal-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        🎺 Song Library
                    </h1>
                    <p className="text-gray-600">
                        Choose a song and difficulty level to start playing
                    </p>
                </div>

                {/* Genre Filter */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setGenreFilter('all')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                genreFilter === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={genreFilter === 'all' ? { backgroundColor: '#FF5500' } : {}}
                        >
                            All Songs
                        </button>
                        <button
                            onClick={() => setGenreFilter('classical')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                genreFilter === 'classical'
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={genreFilter === 'classical' ? { backgroundColor: '#14b8a6' } : {}}
                        >
                            Classical
                        </button>
                        <button
                            onClick={() => setGenreFilter('folk')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                genreFilter === 'folk'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={genreFilter === 'folk' ? { backgroundColor: '#10b981' } : {}}
                        >
                            Folk
                        </button>
                        <button
                            onClick={() => setGenreFilter('christmas')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                genreFilter === 'christmas'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={genreFilter === 'christmas' ? { backgroundColor: '#ef4444' } : {}}
                        >
                            Christmas
                        </button>
                        <button
                            onClick={() => setGenreFilter('jazz')}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                genreFilter === 'jazz'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={genreFilter === 'jazz' ? { backgroundColor: '#f59e0b' } : {}}
                        >
                            Jazz
                        </button>
                    </div>
                </div>

                {/* Songs Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🎵</div>
                        <p className="text-gray-600">Loading songs...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {songs.map(song => (
                            <SongCard
                                key={song.id}
                                song={song}
                                onPlay={handlePlaySong}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && songs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎺</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            No songs found
                        </h3>
                        <p className="text-gray-600">
                            Try selecting a different genre
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Song Card Component
const SongCard = ({ song, onPlay }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');

    const genreColors = {
        classical: '#14b8a6',
        folk: '#10b981',
        christmas: '#ef4444',
        jazz: '#f59e0b'
    };

    const difficultyColors = {
        beginner: '#10b981',
        intermediate: '#f59e0b',
        advanced: '#ef4444'
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6">
            {/* Genre Badge */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: genreColors[song.genre] || '#6b7280' }}
                >
                    {song.genre.charAt(0).toUpperCase() + song.genre.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                    {song.tempo} BPM
                </span>
            </div>

            {/* Song Info */}
            <h3 className="text-xl font-bold text-gray-800 mb-1">
                {song.title}
            </h3>
            <p className="text-gray-600 mb-4">
                {song.composer || song.artist || 'Traditional'}
            </p>

            {/* Difficulty Selector */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Difficulty Level:
                </label>
                <div className="flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(diff => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                selectedDifficulty === diff
                                    ? 'text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={
                                selectedDifficulty === diff
                                    ? { backgroundColor: difficultyColors[diff] }
                                    : {}
                            }
                        >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Play Button */}
            <button
                onClick={() => onPlay(song.id, selectedDifficulty)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                style={{ backgroundColor: '#FF5500' }}
            >
                ▶ Play Now
            </button>
        </div>
    );
};

export default SongLibraryPage;