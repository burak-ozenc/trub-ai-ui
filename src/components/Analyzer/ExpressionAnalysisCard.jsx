import React from 'react';
import {TrendingUp} from 'lucide-react';

const ExpressionAnalysisCard = ({expressionData}) => {
    if (!expressionData) return null;

    return (
        <div className="mb-4">
            <h4 className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4"/>
                Musical Expression
            </h4>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="mb-2">
                    <span className="text-xs text-amber-600 font-medium">Dynamic Range</span>
                    <div className="mt-1 bg-white rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-amber-600 transition-all"
                            style={{width: `${Math.min(expressionData.dynamic_range * 1000, 100)}%`}}
                        ></div>
                    </div>
                </div>
                <p className="text-sm text-amber-800 mt-2">{expressionData.expression_level}</p>
                <p className="text-xs text-amber-700 mt-2 italic">{expressionData.recommendations}</p>
            </div>
        </div>
    );
};

export default ExpressionAnalysisCard;