import React, {useState} from 'react';
import {Music, Play, Pause, ChevronDown, ChevronUp, Minus, Plus} from 'lucide-react';
import useMetronome from '../../hooks/useMetronome';

const MetronomeSidebar = () => {
    const [contentExpanded, setContentExpanded] = useState(true);
    const {isPlaying, bpm, beatCount, toggle, changeBpm} = useMetronome();

    const handleBpmChange = (delta) => {
        changeBpm(bpm + delta);
    };

    return (
        <div
            className="fixed bottom-0 right-0 bg-white shadow-2xl transition-all duration-300 z-40 flex flex-col border-l-2 border-t-2 border-teal-200 rounded-tl-2xl w-96">
            {/* Content */}
            <div className="flex flex-col">
                {/* Header - Collapsible */}
                <button
                    onClick={() => setContentExpanded(!contentExpanded)}
                    className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 flex items-center justify-between hover:from-teal-100 hover:to-teal-150 transition-colors border-b-2 border-teal-200"
                >
                    <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-teal-600"/>
                        <h2 className="text-lg font-semibold text-gray-900">Metronome</h2>
                        {isPlaying && (
                            <span className="text-sm text-teal-600 font-medium">{bpm} BPM</span>
                        )}
                    </div>
                    {contentExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500"/>
                    ) : (
                        <ChevronUp className="w-5 h-5 text-gray-500"/>
                    )}
                </button>

                {/* Expanded Content */}
                {contentExpanded && (
                    <div className="p-6 space-y-4">
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
                                <Minus className="w-5 h-5 text-gray-700"/>
                            </button>

                            <input
                                type="range"
                                min="40"
                                max="240"
                                value={bpm}
                                onChange={(e) => changeBpm(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />

                            <button
                                onClick={() => handleBpmChange(5)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <Plus className="w-5 h-5 text-gray-700"/>
                            </button>
                        </div>

                        {/* Beat Indicator */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4].map((beat) => (
                                <div
                                    key={beat}
                                    className={`w-4 h-4 rounded-full transition-all ${
                                        isPlaying && beatCount === beat
                                            ? 'bg-teal-500 scale-150 shadow-lg'
                                            : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Play/Pause Button */}
                        <button
                            onClick={toggle}
                            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                                isPlaying
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-5 h-5"/>
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5"/>
                                        Start
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                )}

                {/* Minimized View - Show beats even when collapsed */}
                {!contentExpanded && isPlaying && (
                    <div className="p-4 flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((beat) => (
                            <div
                                key={beat}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    beatCount === beat
                                        ? 'bg-teal-500 scale-125'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetronomeSidebar;