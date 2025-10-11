import React, { useState } from 'react';
import { Music, Play, Pause, ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react';
import useMetronome from '../../hooks/useMetronome';

const MetronomeWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { isPlaying, bpm, beatCount, toggle, changeBpm } = useMetronome();

    const handleBpmChange = (delta) => {
        changeBpm(bpm + delta);
    };

    return (
        <div className="fixed bottom-4 left-4 z-40">
            {/* Expanded View */}
            {isExpanded && (
                <div className="bg-white rounded-t-2xl shadow-2xl border-2 border-teal-200 p-4 w-64 mb-0">
                    <div className="space-y-4">
                        {/* BPM Display */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-800">{bpm}</div>
                            <div className="text-sm text-gray-500">BPM</div>
                        </div>

                        {/* BPM Controls */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => handleBpmChange(-5)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Minus className="w-5 h-5 text-gray-700" />
                            </button>

                            <input
                                type="range"
                                min="40"
                                max="240"
                                value={bpm}
                                onChange={(e) => changeBpm(parseInt(e.target.value))}
                                className="flex-1"
                            />

                            <button
                                onClick={() => handleBpmChange(5)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Beat Indicator */}
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4].map((beat) => (
                                <div
                                    key={beat}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        isPlaying && beatCount === beat
                                            ? 'bg-teal-500 scale-125'
                                            : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Play/Pause Button */}
                        <button
                            onClick={toggle}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                isPlaying
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-5 h-5" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Start
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Collapsed/Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-3 shadow-lg transition-all ${
                    isExpanded ? 'rounded-b-2xl' : 'rounded-2xl'
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        <span className="font-semibold">Metronome</span>
                        {isPlaying && !isExpanded && (
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">
                                {bpm} BPM
                            </span>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronUp className="w-5 h-5" />
                    )}
                </div>
            </button>
        </div>
    );
};

export default MetronomeWidget;