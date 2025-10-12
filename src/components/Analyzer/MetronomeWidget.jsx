import React from 'react';
import { Music, Play, Pause, Minus, Plus } from 'lucide-react';
import useMetronome from '../../hooks/useMetronome';

const MetronomeWidget = ({ isCollapsed, onToggle }) => {
    const { isPlaying, bpm, beatCount, toggle, changeBpm } = useMetronome();

    const handleBpmChange = (delta) => {
        changeBpm(bpm + delta);
    };
    
    return (
        <>
            {/* Expanded Content */}
            {!isCollapsed && (
                <div className="bg-white border-t-2 border-gray-200 p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Music className="w-5 h-5 text-teal-600" />
                                <h3 className="font-semibold text-gray-900">Metronome</h3>
                            </div>
                        </div>

                        {/* BPM Display */}
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800">{bpm}</div>
                            <div className="text-xs text-gray-500">BPM</div>
                        </div>

                        {/* BPM Controls */}
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={() => handleBpmChange(-5)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Minus className="w-4 h-4 text-gray-700" />
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
                                <Plus className="w-4 h-4 text-gray-700" />
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
                            className={`w-full py-2 rounded-lg font-semibold transition-all text-sm ${
                                isPlaying
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4" />
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Start
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MetronomeWidget;