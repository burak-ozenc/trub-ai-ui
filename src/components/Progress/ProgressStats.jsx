import React from 'react';
import { Music, Clock, TrendingUp, Award } from 'lucide-react';

const ProgressStats = ({ stats }) => {
    const formatTime = (seconds) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
    };

    const statCards = [
        {
            icon: Music,
            label: 'Total Recordings',
            value: stats.total_recordings || 0,
            color: 'blue'
        },
        {
            icon: Clock,
            label: 'Practice Time',
            value: formatTime(stats.total_practice_time || 0),
            color: 'green'
        },
        {
            icon: TrendingUp,
            label: 'Avg Breath Control',
            value: stats.averages?.breath?.toFixed(1) || '0.0',
            color: 'purple'
        },
        {
            icon: Award,
            label: 'Avg Tone Quality',
            value: stats.averages?.tone?.toFixed(1) || '0.0',
            color: 'yellow'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">
                            {stat.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressStats;