import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUpcomingPractices } from '../../store/slices/calendarSlice';
import {
    Music,
    Home,
    Target,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    X,
    ChevronDown
} from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const dispatch = useAppDispatch();
    const { upcomingPractices } = useAppSelector((state) => state.calendar);

    const [showNotification, setShowNotification] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        dispatch(fetchUpcomingPractices(10));
    }, [dispatch]);

    // Get today's practices
    const today = new Date();
    const todaysPractices = upcomingPractices.filter(practice => {
        const practiceDate = new Date(practice.scheduled_date);
        return practiceDate.toDateString() === today.toDateString();
    });

    // Get this week's practices
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekPractices = upcomingPractices.filter(practice => {
        const practiceDate = new Date(practice.scheduled_date);
        return practiceDate >= weekStart && practiceDate <= weekEnd;
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navButtonClass = (path) => {
        return `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isActive(path)
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
        }`;
    };

    return (
        <>
            {/* Main Header */}
            <div className="bg-white shadow-md border-b-2 border-orange-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-3 group"
                        >
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                    Trumpet Analyzer
                                </h1>
                                <p className="text-xs text-gray-500">AI-Powered Coaching</p>
                            </div>
                        </button>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/')}
                                className={navButtonClass('/')}
                            >
                                <Home className="w-5 h-5" />
                                <span className="hidden md:inline">Home</span>
                            </button>

                            <button
                                onClick={() => navigate('/practice')}
                                className={navButtonClass('/practice')}
                            >
                                <Target className="w-5 h-5" />
                                <span className="hidden md:inline">Practice</span>
                            </button>

                            <button
                                onClick={() => navigate('/calendar')}
                                className={`${navButtonClass('/calendar')} relative`}
                            >
                                <Calendar className="w-5 h-5" />
                                <span className="hidden md:inline">Calendar</span>
                                {todaysPractices.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {todaysPractices.length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/progress')}
                                className={navButtonClass('/progress')}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span className="hidden md:inline">Progress</span>
                            </button>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            {weekPractices.length > 0 && (
                                <button
                                    onClick={() => setShowNotification(!showNotification)}
                                    className="relative p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                        {weekPractices.length}
                                    </span>
                                </button>
                            )}

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.full_name || user?.username}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {user?.skill_level || 'Intermediate'}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                </button>

                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {user?.full_name || user?.username}
                                            </p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-orange-50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span className="text-sm">Settings</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setShowUserMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Bar */}
            {showNotification && weekPractices.length > 0 && (
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5" />
                                <div>
                                    <p className="font-semibold">
                                        {todaysPractices.length > 0
                                            ? `You have ${todaysPractices.length} practice${todaysPractices.length !== 1 ? 's' : ''} scheduled today!`
                                            : `${weekPractices.length} practice${weekPractices.length !== 1 ? 's' : ''} scheduled this week`
                                        }
                                    </p>
                                    <p className="text-sm text-teal-100">
                                        Stay consistent with your practice routine
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/calendar')}
                                    className="bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                                >
                                    View Calendar
                                </button>
                                <button
                                    onClick={() => setShowNotification(false)}
                                    className="p-2 hover:bg-teal-400 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;