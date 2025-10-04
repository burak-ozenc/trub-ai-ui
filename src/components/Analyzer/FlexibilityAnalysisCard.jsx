import React from 'react';
import {Zap} from 'lucide-react';

const FlexibilityAnalysisCard = ({flexibilityData}) => {
    if (!flexibilityData) return null;

    return (
        <div className="mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4"/>
                Note Flexibility
            </h4>
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <div className="mb-2">
                    <span className="text-xs text-indigo-600 font-medium">Transition Smoothness</span>
                    <div className="mt-1 bg-white rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{width: `${flexibilityData.transition_smoothness * 100}%`}}
                        ></div>
                    </div>
                </div>
                <p className="text-sm text-indigo-800 mt-2">{flexibilityData.flexibility_level}</p>
                <p className="text-xs text-indigo-700 mt-2 italic">{flexibilityData.recommendations}</p>
            </div>
        </div>
    );
};

export default FlexibilityAnalysisCard;