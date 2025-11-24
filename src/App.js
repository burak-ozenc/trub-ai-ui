import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthProvider } from './context/AuthContext';
import store from './store';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HomePage from './Pages/HomePage';
import SongLibraryPage from './Pages/SongLibraryPage';
import PlayAlongPage from './Pages/PlayAlongPage';
import ProfileSettings from './components/Profile/ProfileSettings';
import ProgressDashboard from './components/Progress/ProgressDashboard';
import PracticePage from './Pages/PracticePage';
import CalendarPage from './Pages/CalendarPage';

function App() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/songs"
                            element={
                                <ProtectedRoute>
                                    <SongLibraryPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/play-along/:songId/:difficulty"
                            element={
                                <ProtectedRoute>
                                    <PlayAlongPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/practice"
                            element={
                                <ProtectedRoute>
                                    <PracticePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <ProtectedRoute>
                                    <CalendarPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfileSettings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/progress"
                            element={
                                <ProtectedRoute>
                                    <ProgressDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </Provider>
    );
}

export default App;