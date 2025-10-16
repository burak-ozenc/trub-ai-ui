import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { saveRecordingToDb } from '../store/slices/recordingsSlice';
import { Music, Settings, BarChart3, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import TunerWidget from './Analyzer/TunerWidget';
import GuidancePrompt from './Analyzer/GuidancePrompt';
import RecordButton from './Analyzer/RecordButton';
import AnalysisResults from './Analyzer/AnalysisResults';
import RecordingHistory from './Analyzer/RecordingHistory';
import MetronomeSidebar from './Analyzer/MetronomeSidebar';
import ChatSidebar from './Analyzer/ChatSidebar';
import Header from "./Common/Header";

const TrumpetAnalyzer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Analysis state
    const [analysisResult, setAnalysisResult] = useState(null);
    const [guidance, setGuidance] = useState('');

    // Chat state
    const [chatMessages, setChatMessages] = useState([]);
    const [chatQuestion, setChatQuestion] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // UI state
    const [historyCollapsed, setHistoryCollapsed] = useState(true);
    const [chatCollapsed, setChatCollapsed] = useState(true);
    const [tunerMinimized, setTunerMinimized] = useState(false);
    const [resultsCollapsed, setResultsCollapsed] = useState(false);

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Get user skill level
    const skillLevel = user?.skill_level || 'intermediate';

    // Recording functions
    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const startRecording = async () => {
        if (!guidance.trim()) {
            setError('Please enter your practice goal first');
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

    // Analysis function
    const analyzeAudio = async (audioBlob) => {
        setIsAnalyzing(true);
        setError('');
        setResultsCollapsed(false);

        try {
            const data = await api.analyzeAudio(audioBlob, guidance, 'full');
            setAnalysisResult(data);

            const fileName = `recording_${Date.now()}.wav`;
            const tempId = Date.now().toString();
            const recordingData = {
                filename: fileName,
                guidance: guidance,
                analysis_type: 'full',
                duration: 0,
                analysis_results: data.technical_analysis || {},
                audio_file_path: data.file_path || null
            };

            dispatch(saveRecordingToDb({ ...recordingData, tempId }));

        } catch (err) {
            setError('Error analyzing audio: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Chat functions
    const sendChatMessage = async () => {
        if (!chatQuestion.trim()) return;

        const userMessage = { type: 'user', content: chatQuestion };
        setChatMessages(prev => [...prev, userMessage]);

        setIsChatLoading(true);
        const currentQuestion = chatQuestion;
        setChatQuestion('');

        try {
            const data = await api.askQuestion(currentQuestion);
            const botMessage = { type: 'bot', content: data.answer };
            setChatMessages(prev => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = { type: 'error', content: 'Failed to get response: ' + err.message };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <Header/>

            {/* Main Content with dynamic margins for sidebars */}
            <div className={`transition-all duration-300 ${
                chatCollapsed ? 'ml-0' : 'ml-[36rem]'
            } ${
                historyCollapsed ? 'mr-0' : 'mr-96'
            }`}>
                <div className="max-w-5xl mx-auto px-6 py-8">

                    {/* Hero Tuner Section */}
                    <div className="mb-8">
                        <TunerWidget
                            skillLevel={skillLevel}
                            isMinimized={tunerMinimized}
                            onToggleMinimize={() => setTunerMinimized(!tunerMinimized)}
                        />
                    </div>

                    {/* Recording Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-orange-100">
                        {/* Guidance Prompt */}
                        <div className="mb-6">
                            <GuidancePrompt
                                value={guidance}
                                onChange={setGuidance}
                                disabled={isRecording || isAnalyzing}
                            />
                        </div>

                        {/* Record Button */}
                        <div className="flex justify-center mb-4">
                            <RecordButton
                                isRecording={isRecording}
                                isAnalyzing={isAnalyzing}
                                onToggle={toggleRecording}
                                disabled={!guidance.trim()}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="max-w-xl mx-auto">
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-center text-sm">
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analysis Results - Collapsible */}
                    {analysisResult && (
                        <div className="mb-8">
                            <button
                                onClick={() => setResultsCollapsed(!resultsCollapsed)}
                                className="w-full flex items-center justify-between bg-white px-6 py-3 rounded-t-xl shadow-lg hover:bg-orange-50 transition-colors border-2 border-orange-100"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">Analysis Results</h2>
                                <span className="text-orange-600 text-sm font-medium">
                                    {resultsCollapsed ? 'Show' : 'Hide'}
                                </span>
                            </button>
                            {!resultsCollapsed && (
                                <div className="bg-white rounded-b-xl shadow-lg border-x-2 border-b-2 border-orange-100">
                                    <AnalysisResults analysisResult={analysisResult} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Sidebar - Left - Even Wider */}
            <div className={`fixed top-0 left-0 h-full shadow-2xl transition-all duration-300 z-30 ${
                chatCollapsed ? 'w-0' : 'w-[36rem]'
            }`}>
                {/* Toggle Button */}
                <button
                    onClick={() => setChatCollapsed(!chatCollapsed)}
                    className="absolute -right-12 top-32 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-4 rounded-r-xl transition-colors shadow-lg flex flex-col items-center gap-1"
                    title="AI Teacher Chat"
                >
                    {chatCollapsed ? (
                        <>
                            <ChevronRight className="w-5 h-5" />
                            <MessageCircle className="w-4 h-4 mt-1" />
                        </>
                    ) : (
                        <ChevronLeft className="w-5 h-5" />
                    )}
                </button>

                {!chatCollapsed && (
                    <ChatSidebar
                        messages={chatMessages}
                        question={chatQuestion}
                        isLoading={isChatLoading}
                        onQuestionChange={setChatQuestion}
                        onSend={sendChatMessage}
                        onKeyPress={handleKeyPress}
                    />
                )}
            </div>

            {/* Recording History Sidebar - Right */}
            <RecordingHistory
                isCollapsed={historyCollapsed}
                onToggle={() => setHistoryCollapsed(!historyCollapsed)}
            />

            {/* Metronome Sidebar - Bottom Right - Always visible, collapsible via header */}
            <MetronomeSidebar />
        </div>
    );
};

export default TrumpetAnalyzer;