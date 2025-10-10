import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { authUtils } from '../utils/auth';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initAuthRef = useRef(false);

    // Check if user is logged in on mount
    useEffect(() => {
        // Prevent duplicate initialization
        if (initAuthRef.current) return;
        initAuthRef.current = true;

        const initAuth = async () => {
            const token = authUtils.getToken();
            const savedUser = authUtils.getUser();

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const currentUser = await api.getCurrentUser();
                    setUser(currentUser);
                    authUtils.setUser(currentUser);
                } catch (err) {
                    // Token invalid, clear auth
                    authUtils.clearAuth();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            await api.register(userData);

            // Auto-login after registration
            const loginData = await api.login(userData.username, userData.password);
            authUtils.setToken(loginData.access_token);

            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
            authUtils.setUser(currentUser);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const data = await api.login(username, password);
            authUtils.setToken(data.access_token);

            const currentUser = await api.getCurrentUser();
            setUser(currentUser);
            authUtils.setUser(currentUser);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        authUtils.clearAuth();
        setUser(null);
        setError(null);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        authUtils.setUser(updatedUser);
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};