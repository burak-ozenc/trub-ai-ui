import {BarChart3, Music, Settings, LogOut} from "lucide-react";
import React from "react";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-white shadow-sm border-b-2 border-orange-100">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg">
                            <Music className="w-6 h-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                Trumpet Analyzer
                            </h1>
                            <p className="text-xs text-gray-500">AI-powered coaching</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                            <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => navigate('/progress')}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            <BarChart3 className="w-4 h-4"/>
                            Progress
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Settings className="w-4 h-4"/>
                            Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4"/>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header