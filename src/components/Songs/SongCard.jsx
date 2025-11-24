import React, { useState } from 'react';

const SongCard = ({ song, onPlay }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');

    const difficultyColors = {
        beginner: 'bg-green-500',
        intermediate: 'bg-yellow-500',
        advanced: 'bg-red-500'
    };

    return (
        <div className="song-card border rounded-lg p-4 hover:shadow-lg">
            <h3 className="text-lg font-bold">{song.title}</h3>
            <p className="text-gray-600">{song.artist || song.composer}</p>

            <div className="difficulty-selector mt-2">
                <label className="text-sm">Difficulty:</label>
                <div className="flex gap-2 mt-1">
                    {['beginner', 'intermediate', 'advanced'].map(diff => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`px-2 py-1 rounded text-xs ${
                                selectedDifficulty === diff
                                    ? difficultyColors[diff] + ' text-white'
                                    : 'bg-gray-200'
                            }`}
                        >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => onPlay(song.id, selectedDifficulty)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                Play ▶
            </button>
        </div>
    );
};

export default SongCard;