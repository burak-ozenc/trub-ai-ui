import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Music, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.username, formData.password);

        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl">
                            <Music className="w-16 h-16 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        Sign in to Trumpet Analyzer
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                            create a new account
                        </Link>
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6 bg-white rounded-2xl shadow-xl border-2 border-orange-100 p-8" onSubmit={handleSubmit}>
                    {/* Error Message */}
                    {(error || authError) && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-red-700 font-medium">
                                {error || authError}
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm"
                                placeholder="Enter your username"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LogIn className="h-5 w-5" />
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;