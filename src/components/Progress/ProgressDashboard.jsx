import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import ProgressStats from './ProgressStats';
import ProgressCharts from './ProgressCharts';

const ProgressDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProgressData();
    }, []);

    const loadProgressData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getProgressStats();
            setStats(data);
        } catch (err) {
            setError('Failed to load progress data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-gray-600">Loading your progress...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Analyzer
                        </button>
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Analyzer
                            </button>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
                                    <p className="text-gray-600 mt-1">Track your trumpet performance over time</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <ProgressStats stats={stats} />

                {/* Charts */}
                <ProgressCharts trends={stats?.trends || []} />

                {/* Practice Insights */}
                {stats && stats.total_recordings > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Insights</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm text-gray-700">Total Practice Sessions</span>
                                <span className="font-semibold text-blue-600">{stats.total_recordings}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-sm text-gray-700">Average Breath Control</span>
                                <span className="font-semibold text-green-600">{stats.averages?.breath?.toFixed(1) || '0.0'}/10</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <span className="text-sm text-gray-700">Average Tone Quality</span>
                                <span className="font-semibold text-purple-600">{stats.averages?.tone?.toFixed(1) || '0.0'}/10</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {stats && stats.total_recordings === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <div className="text-center py-8">
                            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data Yet</h3>
                            <p className="text-gray-600 mb-4">
                                Start recording and analyzing your trumpet performances to see your progress over time!
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                                Start Recording
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressDashboard;