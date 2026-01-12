import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    startSession,
    startSessionFromCalendar,
    completeSession,
    clearCurrentSession,
    setCalendarEntryId
} from '../../store/slices/practiceSlice';
import { saveRecordingToDb } from '../../store/slices/recordingsSlice';
import { completeEntry } from '../../store/slices/calendarSlice';
import { api } from '../../services/api';
import { ArrowLeft, Target } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import SheetMusicViewer from './SheetMusicViewer';
import PracticeControls from './PracticeControls';
import SimpleFeedback from './SimpleFeedback';
import TunerWidget from '../Analyzer/TunerWidget';
import MetronomeSidebar from '../Analyzer/MetronomeSidebar';
import {useAuth} from "../../context/AuthContext";

const PracticeMode = ({ exercise, onBack, calendarEntryId = null }) => {
    const dispatch = useAppDispatch();
    const { currentSession, isSessionActive, sessionStartTime } = useAppSelector(
        (state) => state.practice
    );
    const { user } = useAuth();

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [error, setError] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [recordingId, setRecordingId] = useState(null);  // NEW: Track recording ID

    // UI State
    const [tunerMinimized, setTunerMinimized] = useState(false);

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const sessionInitialized = useRef(false);  // NEW: Prevent double initialization

    // Start practice session when component mounts
    useEffect(() => {
        const initializeSession = async () => {
            if (sessionInitialized.current) return;  // Prevent duplicate calls
            sessionInitialized.current = true;

            if (!exercise) {
                setError('No exercise provided');
                return;
            }

            try {
                if (calendarEntryId) {
                    // Start from calendar entry
                    console.log('Starting session from calendar entry:', calendarEntryId);
                    await dispatch(startSessionFromCalendar(calendarEntryId)).unwrap();
                    dispatch(setCalendarEntryId(calendarEntryId));
                } else {
                    // Regular practice session
                    console.log('Starting regular session for exercise:', exercise.id);
                    await dispatch(startSession(exercise.id)).unwrap();
                }
                console.log('Session started successfully');
            } catch (err) {
                console.error('Error starting session:', err);
                setError('Failed to start practice session: ' + err.message);
            }
        };

        initializeSession();

        return () => {
            // Cleanup: if leaving without completing, complete the session
            if (isSessionActive && currentSession && !currentSession.completed) {
                const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
                dispatch(completeSession({
                    sessionId: currentSession.id,
                    data: { duration_seconds: duration }
                }));
            }
        };
    }, []); // Empty deps - only run once

    // Recording functions
    const startRecording = async () => {
        if (!isSessionActive) {
            setError('Practice session is not active. Please wait...');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                await analyzeAudio(audioBlob);
                audioChunks.current = [];
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setError('');
        } catch (err) {
            setError('Error accessing microphone: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const analyzeAudio = async (audioBlob) => {
        setIsAnalyzing(true);
        setError('');

        try {
            // Create guidance based on exercise
            const guidance = `Focus on ${exercise.technique}: ${exercise.title}`;

            // Analyze the audio - Backend now returns simplified_feedback
            const data = await api.analyzeAudio(audioBlob, guidance, 'full');

            // Check if simplified_feedback exists in response
            if (data.simplified_feedback) {
                setAnalysisResult(data);
            } else {
                console.warn('No simplified feedback from backend');
                setAnalysisResult(data);
            }

            setHasRecorded(true);

            // Save recording to database
            const fileName = `practice_${exercise.id}_${Date.now()}.wav`;
            const recordingData = {
                filename: fileName,
                guidance: guidance,
                analysis_type: 'full',
                duration: 0,
                analysis_results: data.technical_analysis || {},
                audio_file_path: data.file_path || null
            };

            const savedRecording = await dispatch(saveRecordingToDb({
                ...recordingData,
                tempId: Date.now().toString()
            })).unwrap();

            // Store the recording ID for completion
            if (savedRecording && savedRecording.id) {
                setRecordingId(savedRecording.id);
                console.log('Recording saved with ID:', savedRecording.id);
            }

        } catch (err) {
            setError('Error analyzing audio: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const completeWithRecording = async () => {
        if (!currentSession) {
            setError('No active session to complete');
            return;
        }

        if (!recordingId) {
            setError('No recording found');
            return;
        }

        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);

        try {
            const completionData = {
                duration_seconds: duration,
                recording_id: recordingId  // Use the stored recording ID
            };

            console.log('Completing session:', currentSession.id, 'with data:', completionData);

            // If linked to calendar, pass the calendar_entry_id
            if (calendarEntryId) {
                await api.completePracticeWithCalendar(
                    currentSession.id,
                    calendarEntryId,
                    completionData
                );

                // Mark calendar entry as complete
                await dispatch(completeEntry({
                    entryId: calendarEntryId,
                    practiceSessionId: currentSession.id
                }));
            } else {
                // Regular completion
                await dispatch(completeSession({
                    sessionId: currentSession.id,
                    data: completionData
                })).unwrap();
            }

            console.log('Session completed successfully');

            // Show success and go back after delay
            setTimeout(() => {
                dispatch(clearCurrentSession());
                onBack();
            }, 2000);
        } catch (error) {
            console.error('Error completing practice:', error);
            setError('Failed to complete practice session: ' + error.message);
        }
    };

    const completeWithoutRecording = async () => {
        if (!currentSession) {
            setError('No active session to complete');
            return;
        }

        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);

        try {
            const completionData = {
                duration_seconds: duration,
                recording_id: null
            };

            console.log('Completing session without recording:', currentSession.id);

            // If linked to calendar, pass the calendar_entry_id
            if (calendarEntryId) {
                await api.completePracticeWithCalendar(
                    currentSession.id,
                    calendarEntryId,
                    completionData
                );

                // Mark calendar entry as complete
                await dispatch(completeEntry({
                    entryId: calendarEntryId,
                    practiceSessionId: currentSession.id
                }));
            } else {
                // Regular completion
                await dispatch(completeSession({
                    sessionId: currentSession.id,
                    data: completionData
                })).unwrap();
            }

            console.log('Session completed without recording');

            dispatch(clearCurrentSession());
            onBack();
        } catch (error) {
            console.error('Error completing practice:', error);
            setError('Failed to complete practice session: ' + error.message);
        }
    };

    // Debug logging
    useEffect(() => {
        console.log('Session State:', {
            currentSession,
            isSessionActive,
            sessionStartTime,
            calendarEntryId,
            exerciseId: exercise?.id
        });
    }, [currentSession, isSessionActive, sessionStartTime, calendarEntryId, exercise]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to {calendarEntryId ? 'Calendar' : 'Exercises'}</span>
                </button>

                {/* Calendar Link Indicator */}
                {calendarEntryId && (
                    <div className="mb-4 bg-teal-50 border-2 border-teal-300 rounded-xl p-4">
                        <p className="text-teal-800 font-medium">
                            📅 This practice is linked to your calendar schedule
                        </p>
                    </div>
                )}

                {/* Session Status Debug Info - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                        <p className="text-blue-800 text-sm">
                            <strong>Debug:</strong> Session Active: {isSessionActive ? 'Yes' : 'No'} |
                            Session ID: {currentSession?.id || 'None'} |
                            Recording ID: {recordingId || 'None'}
                        </p>
                    </div>
                )}

                {/* Tuner Widget - Full Width */}
                <div className="mb-6">
                    <TunerWidget
                        skillLevel={user?.skill_level || 'intermediate'}
                        isMinimized={tunerMinimized}
                        onToggleMinimize={() => setTunerMinimized(!tunerMinimized)}
                    />
                </div>

                {/* Exercise Info */}
                <div className="mb-6">
                    <ExerciseCard exercise={exercise} isSelected={true} onSelect={() => {}} />
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl p-6 mb-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                        <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                            <div className="text-gray-700 whitespace-pre-line">{exercise.instructions}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-24">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Sheet Music */}
                        <SheetMusicViewer
                            sheetMusicUrl={exercise.sheet_music_url}
                            exerciseTitle={exercise.title}
                        />

                        {/* Practice Controls */}
                        <PracticeControls
                            isRecording={isRecording}
                            isAnalyzing={isAnalyzing}
                            hasRecorded={hasRecorded}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            onCompleteWithoutRecording={completeWithoutRecording}
                            disabled={!isSessionActive}
                        />
                    </div>

                    {/* Right Column - Feedback */}
                    <div>
                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        {analysisResult?.simplified_feedback && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Feedback</h3>
                                <SimpleFeedback feedback={analysisResult.simplified_feedback} />

                                {/* Complete Button */}
                                <button
                                    onClick={completeWithRecording}
                                    disabled={!recordingId}
                                    className={`w-full mt-6 px-6 py-4 rounded-xl font-semibold shadow-lg transition-all ${
                                        recordingId
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Complete Practice Session ✓
                                </button>
                            </div>
                        )}

                        {!analysisResult && !isAnalyzing && (
                            <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
                                <p className="text-gray-500">
                                    {isSessionActive
                                        ? 'Record your practice to get instant feedback!'
                                        : 'Starting practice session...'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metronome Sidebar - Fixed bottom-right */}
            <MetronomeSidebar />
        </div>
    );
};

export default PracticeMode;