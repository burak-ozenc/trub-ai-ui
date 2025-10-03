import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Settings } from 'lucide-react';

const Header = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Music className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Trumpet Analyzer</h1>
                        <p className="text-gray-600 mt-1">AI-powered trumpet performance analysis and coaching</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-3">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;