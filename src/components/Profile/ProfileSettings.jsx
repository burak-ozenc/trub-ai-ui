import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {api} from '../../services/api';
import {User, Save, AlertCircle, CheckCircle, Settings as SettingsIcon, ArrowLeft} from 'lucide-react';
import SettingsPanel from '../Analyzer/SettingsPanel';
import Header from '../Common/Header';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const {user, updateUser} = useAuth();

    const [activeTab, setActiveTab] = useState('profile'); // profile or settings

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        skill_level: user?.skill_level || ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setSuccess(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const updatedUser = await api.updateProfile(formData);
            updateUser(updatedUser);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <Header />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Analyzer</span>
                    </button>

                    {/* Page Title */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                <User className="w-6 h-6 text-white"/>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                    Settings
                                </h1>
                                <p className="text-gray-600">@{user?.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 mb-6">
                        <div className="border-b border-orange-100">
                            <nav className="flex -mb-px">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'profile'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <User className="w-4 h-4 inline mr-2"/>
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === 'settings'
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <SettingsIcon className="w-4 h-4 inline mr-2"/>
                                    App Settings
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'profile' ? (
                        <>
                            {/* Profile Form */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Profile</h2>

                                {/* Messages */}
                                {success && (
                                    <div
                                        className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-start mb-6">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5"/>
                                        <div className="text-sm text-emerald-700 font-medium">Profile updated successfully!</div>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start mb-6">
                                        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5"/>
                                        <div className="text-sm text-red-700 font-medium">{error}</div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Email (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            id="full_name"
                                            name="full_name"
                                            type="text"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    {/* Skill Level */}
                                    <div>
                                        <label htmlFor="skill_level"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            Skill Level
                                        </label>
                                        <select
                                            id="skill_level"
                                            name="skill_level"
                                            value={formData.skill_level}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                                        >
                                            <option value="">Select your skill level</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="professional">Professional</option>
                                        </select>
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                                            placeholder="Tell us about yourself and your trumpet journey..."
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save className="w-4 h-4"/>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/')}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Account Info */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6 mt-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Username:</span>
                                        <span className="font-medium text-gray-900">{user?.username}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Account created:</span>
                                        <span className="font-medium text-gray-900">
                                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Account status:</span>
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <SettingsPanel/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;