import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRecommendedExercises } from '../store/slices/exercisesSlice';
import { ArrowLeft, Filter, Sparkles } from 'lucide-react';
import ExerciseCard from '../components/Practice/ExerciseCard';
import PracticeMode from '../components/Practice/PracticeMode';
import Header from '../components/Common/Header';
import MetronomeSidebar from '../components/Analyzer/MetronomeSidebar';

const PracticePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const { exercises, loading, error } = useAppSelector((state) => state.exercises);

    // UI State
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [filterTechnique, setFilterTechnique] = useState(null);

    // Load recommended exercises on mount
    useEffect(() => {
        dispatch(fetchRecommendedExercises(filterTechnique));
    }, [dispatch, filterTechnique]);

    // If an exercise is selected, show practice mode
    if (selectedExercise) {
        return (
            <PracticeMode
                exercise={selectedExercise}
                onBack={() => setSelectedExercise(null)}
            />
        );
    }

    // Otherwise, show exercise selection
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-8 mb-24">
                {/* Page Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Guided Practice
                            </h1>
                            <p className="text-gray-600">
                                Choose an exercise and follow step-by-step guidance
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border-2 border-purple-300">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-purple-900">
                                    {user?.skill_level || 'Intermediate'} Level
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900">Filter by technique:</span>

                            <button
                                onClick={() => setFilterTechnique(null)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    filterTechnique === null
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>

                            {['breathing', 'tone', 'rhythm', 'articulation', 'flexibility'].map((tech) => (
                                <button
                                    key={tech}
                                    onClick={() => setFilterTechnique(tech)}
                                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                                        filterTechnique === tech
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                        <p className="text-gray-600">Loading exercises...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-xl">
                        Error loading exercises: {error}
                    </div>
                )}

                {/* Exercise Grid */}
                {!loading && !error && (
                    <>
                        {exercises.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-12 border-2 border-dashed border-gray-300 text-center">
                                <p className="text-gray-600 text-lg">
                                    No exercises found. Try adjusting your filters.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exercises.map((exercise) => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        exercise={exercise}
                                        onSelect={setSelectedExercise}
                                        isSelected={false}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Info Box */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">How Guided Practice Works</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Select an exercise based on what you want to improve</li>
                        <li>Follow the step-by-step instructions and sheet music</li>
                        <li>Use the tuner and metronome to stay on pitch and tempo</li>
                        <li>Record your practice to get instant AI feedback</li>
                        <li>Get simple, actionable tips to improve your technique</li>
                        <li>Complete the session and track your progress</li>
                    </ol>
                </div>
            </div>

            {/* Metronome Sidebar - Fixed bottom-right */}
            <MetronomeSidebar />
        </div>
    );
};

export default PracticePage;