import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Common/Header';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-teal-50">
            <Header />

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Content */}
                    <div className="mb-12">
                        <h1 className="text-6xl font-bold text-gray-800 mb-4">
                            🎺 Play Along with Your Favorite Songs
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Master the trumpet with AI-powered feedback, professional backing tracks,
                            and songs at every skill level.
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => navigate('/songs')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                            style={{ backgroundColor: '#FF5500' }}
                        >
                            Start Playing Now →
                        </button>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mt-16">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🎵</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                30+ Songs
                            </h3>
                            <p className="text-gray-600">
                                Classical, folk, and popular songs arranged for trumpet at beginner,
                                intermediate, and advanced levels.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Real-Time Feedback
                            </h3>
                            <p className="text-gray-600">
                                AI analyzes your pitch and rhythm as you play, giving instant
                                feedback to improve your technique.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
                            <div className="text-4xl mb-4">🎼</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Professional Backing Tracks
                            </h3>
                            <p className="text-gray-600">
                                Play along with high-quality accompaniment and sheet music
                                that scrolls automatically.
                            </p>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <div className="text-4xl font-bold mb-2" style={{ color: '#FF5500' }}>
                                    30+
                                </div>
                                <div className="text-gray-600">Songs Available</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2" style={{ color: '#14b8a6' }}>
                                    3
                                </div>
                                <div className="text-gray-600">Difficulty Levels</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2" style={{ color: '#10b981' }}>
                                    100%
                                </div>
                                <div className="text-gray-600">Free to Start</div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8">
                            How It Works
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-6">
                                <div className="text-3xl font-bold mb-2" style={{ color: '#FF5500' }}>
                                    1
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Choose a Song</h4>
                                <p className="text-sm text-gray-600">
                                    Browse our library of 30+ songs
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-lg p-6">
                                <div className="text-3xl font-bold mb-2" style={{ color: '#14b8a6' }}>
                                    2
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Select Difficulty</h4>
                                <p className="text-sm text-gray-600">
                                    Pick beginner, intermediate, or advanced
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg p-6">
                                <div className="text-3xl font-bold mb-2" style={{ color: '#10b981' }}>
                                    3
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Play Along</h4>
                                <p className="text-sm text-gray-600">
                                    Follow sheet music with backing track
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg p-6">
                                <div className="text-3xl font-bold mb-2" style={{ color: '#f59e0b' }}>
                                    4
                                </div>
                                <h4 className="font-bold text-gray-800 mb-2">Get Feedback</h4>
                                <p className="text-sm text-gray-600">
                                    Receive AI-powered tips to improve
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-12 text-white shadow-xl">
                        <h2 className="text-3xl font-bold mb-4">
                            Ready to Start Your Musical Journey?
                        </h2>
                        <p className="text-lg mb-6 opacity-90">
                            Join hundreds of trumpet players improving their skills every day.
                        </p>
                        <button
                            onClick={() => navigate('/songs')}
                            className="bg-white text-orange-600 font-bold text-lg px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Browse Song Library →
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">
                        © 2025 Trumpet Analyzer. All songs are public domain.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;