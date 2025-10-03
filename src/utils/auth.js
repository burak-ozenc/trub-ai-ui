// Token storage utilities
const TOKEN_KEY = 'trumpet_analyzer_token';
const USER_KEY = 'trumpet_analyzer_user';

export const authUtils = {
    // Get token from storage
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Save token to storage
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    // Remove token from storage
    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    // Get user from storage
    getUser: () => {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Save user to storage
    setUser: (user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    // Remove user from storage
    removeUser: () => {
        localStorage.removeItem(USER_KEY);
    },

    // Clear all auth data
    clearAuth: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    }
};