import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgressCharts = ({ trends }) => {
    if (!trends || trends.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
                <p className="text-gray-500 text-center py-8">
                    No data yet. Keep practicing to see your progress!
                </p>
            </div>
        );
    }

    // Format data for charts
    const chartData = trends.map((trend, index) => ({
        recording: index + 1,
        date: new Date(trend.date).toLocaleDateString(),
        'Breath Control': trend.breath_score.toFixed(1),
        'Tone Quality': trend.tone_score.toFixed(1),
        'Rhythm': trend.rhythm_score.toFixed(2)
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>

            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Overall Progress</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="recording"
                            label={{ value: 'Recording #', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="Breath Control"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Tone Quality"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Rhythm"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="text-sm font-medium text-blue-900 mb-1">Breath Control</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {chartData[chartData.length - 1]?.['Breath Control'] || '0.0'}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">Latest Score</div>
                </div>

                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="text-sm font-medium text-green-900 mb-1">Tone Quality</div>
                    <div className="text-2xl font-bold text-green-600">
                        {chartData[chartData.length - 1]?.['Tone Quality'] || '0.0'}
                    </div>
                    <div className="text-xs text-green-700 mt-1">Latest Score</div>
                </div>

                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="text-sm font-medium text-purple-900 mb-1">Rhythm</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {chartData[chartData.length - 1]?.['Rhythm'] || '0.00'}
                    </div>
                    <div className="text-xs text-purple-700 mt-1">Latest Score</div>
                </div>
            </div>
        </div>
    );
};

export default ProgressCharts;