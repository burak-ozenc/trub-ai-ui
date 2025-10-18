import React from 'react';
import { CheckCircle, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';

const SimpleFeedback = ({ feedback }) => {
    if (!feedback) return null;

    const getStatusIcon = () => {
        const status = feedback.overall_status.toLowerCase();
        if (status.includes('excellent') || status.includes('great') || status.includes('beautiful')) {
            return <CheckCircle className="w-8 h-8 text-green-500" />;
        } else if (status.includes('good') || status.includes('nice')) {
            return <CheckCircle className="w-8 h-8 text-blue-500" />;
        } else {
            return <AlertCircle className="w-8 h-8 text-orange-500" />;
        }
    };

    const getStatusColor = () => {
        const status = feedback.overall_status.toLowerCase();
        if (status.includes('excellent') || status.includes('great') || status.includes('beautiful')) {
            return 'from-green-50 to-green-100 border-green-300';
        } else if (status.includes('good') || status.includes('nice')) {
            return 'from-blue-50 to-blue-100 border-blue-300';
        } else {
            return 'from-orange-50 to-orange-100 border-orange-300';
        }
    };

    return (
        <div className="space-y-4">
            {/* Overall Status */}
            <div className={`bg-gradient-to-r ${getStatusColor()} rounded-xl p-6 border-2`}>
                <div className="flex items-center gap-4">
                    {getStatusIcon()}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {feedback.overall_status}
                        </h3>
                        {feedback.main_issue && (
                            <p className="text-gray-700 mt-1">{feedback.main_issue}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Quick Tip</h4>
                        <p className="text-gray-700">{feedback.quick_tip}</p>
                    </div>
                </div>
            </div>

            {/* Next Step */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-6 border-2 border-teal-300">
                <div className="flex items-start gap-3">
                    <ArrowRight className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
                        <p className="text-gray-700">{feedback.next_step}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleFeedback;