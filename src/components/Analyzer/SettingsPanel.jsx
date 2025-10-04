import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
    setLlmModel,
    setAudioQuality,
    setShowDetailedMetrics,
    setDefaultAnalysisType,
    resetSettings
} from '../../store/slices/settingsSlice';
import { Settings as SettingsIcon, RefreshCw } from 'lucide-react';

const SettingsPanel = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.settings);

    const handleReset = () => {
        if (window.confirm('Reset all settings to defaults?')) {
            dispatch(resetSettings());
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    App Settings
                </h2>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                </button>
            </div>

            <div className="space-y-6">
                {/* LLM Model Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Model
                    </label>
                    <select
                        value={settings.llmModel}
                        onChange={(e) => dispatch(setLlmModel(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {settings.availableModels.map(model => (
                            <option key={model.id} value={model.id}>
                                {model.name} - {model.description}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Selected model will be used for all AI feedback and analysis
                    </p>
                </div>

                {/* Audio Quality */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audio Quality
                    </label>
                    <select
                        value={settings.audioQuality}
                        onChange={(e) => dispatch(setAudioQuality(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="low">Low (Faster upload)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Best quality)</option>
                    </select>
                </div>

                {/* Default Analysis Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Analysis Type
                    </label>
                    <select
                        value={settings.defaultAnalysisType}
                        onChange={(e) => dispatch(setDefaultAnalysisType(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="full">Full Analysis (All features)</option>
                        <option value="breath">Breath Control Only</option>
                        <option value="tone">Tone Quality Only</option>
                        <option value="rhythm">Rhythm & Timing Only</option>
                    </select>
                </div>

                {/* Show Detailed Metrics */}
                <div className="flex items-center justify-between">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Show Detailed Metrics
                        </label>
                        <p className="text-xs text-gray-500">
                            Display technical analysis details
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.showDetailedMetrics}
                            onChange={(e) => dispatch(setShowDetailedMetrics(e.target.checked))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {/* Storage Info */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Storage</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>• Recordings: {settings.maxRecordingDuration / 60} minutes max</p>
                        <p>• Settings are saved automatically</p>
                        <p>• Audio files not persisted (memory only)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;