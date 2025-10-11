import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { saveRecordingToDb } from '../store/slices/recordingsSlice';
import { Music, MessageCircle, Settings, Send, Loader2, BarChart3 } from 'lucide-react';
import GuidancePrompt from './Analyzer/GuidancePrompt';
import RecordButton from './Analyzer/RecordButton';
import MetronomeWidget from './Analyzer/MetronomeWidget';
import AnalysisResults from './Analyzer/AnalysisResults';
import RecordingHistory from './Analyzer/RecordingHistory';

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
    const [resultsCollapsed, setResultsCollapsed] = useState(false);

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    // const fileInputRef = useRef(null);

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

            // Stop all tracks
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // Analysis function
    const analyzeAudio = async (audioBlob) => {
        setIsAnalyzing(true);
        setError('');
        setResultsCollapsed(false); // Expand results when analysis starts

        try {
            const data = await api.analyzeAudio(audioBlob, guidance, 'full');
            setAnalysisResult(data);

            // Save to database
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Trumpet Analyzer</h1>
                                <p className="text-sm text-gray-500">AI-powered performance coaching</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right mr-3">
                                <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => navigate('/progress')}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Progress
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${historyCollapsed ? 'mr-0' : 'mr-96'}`}>
                <div className="max-w-6xl mx-auto px-6 py-12">
                    {/* Hero Recording Section */}
                    <div className="mb-12">
                        <div className="bg-white rounded-3xl shadow-xl p-12">
                            {/* Guidance Prompt */}
                            <div className="mb-12">
                                <GuidancePrompt
                                    value={guidance}
                                    onChange={setGuidance}
                                    disabled={isRecording || isAnalyzing}
                                />
                            </div>

                            {/* Record Button */}
                            <div className="flex justify-center mb-8">
                                <RecordButton
                                    isRecording={isRecording}
                                    isAnalyzing={isAnalyzing}
                                    onToggle={toggleRecording}
                                    disabled={!guidance.trim()}
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="max-w-2xl mx-auto">
                                    <div className="bg-red-50 border-2 border-red-200 text-red-600 px-6 py-4 rounded-xl text-center">
                                        {error}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Results - Collapsible */}
                    {analysisResult && (
                        <div className="mb-12">
                            <button
                                onClick={() => setResultsCollapsed(!resultsCollapsed)}
                                className="w-full flex items-center justify-between bg-white px-6 py-4 rounded-t-2xl shadow-lg hover:bg-gray-50 transition-colors"
                            >
                                <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                                <span className="text-teal-600 text-sm font-medium">
                                    {resultsCollapsed ? 'Show' : 'Hide'}
                                </span>
                            </button>
                            {!resultsCollapsed && (
                                <div className="bg-white rounded-b-2xl shadow-lg">
                                    <AnalysisResults analysisResult={analysisResult} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Chat Section */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-teal-600" />
                            Chat with AI Teacher
                        </h2>

                        {/* Chat Messages */}
                        <div className="h-80 overflow-y-auto border-2 border-gray-100 rounded-2xl p-6 mb-6 space-y-4 bg-gray-50">
                            {chatMessages.length === 0 ? (
                                <div className="text-gray-400 text-center py-12">
                                    Ask me anything about trumpet technique, practice methods, or music theory!
                                </div>
                            ) : (
                                chatMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-md px-6 py-3 rounded-2xl ${
                                                message.type === 'user'
                                                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
                                                    : message.type === 'error'
                                                        ? 'bg-red-100 text-red-700 border-2 border-red-200'
                                                        : 'bg-white text-gray-800 border-2 border-gray-200'
                                            }`}
                                        >
                                            <pre className="whitespace-pre-wrap text-sm font-sans">
                                                {message.content}
                                            </pre>
                                        </div>
                                    </div>
                                ))
                            )}

                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-800 px-6 py-3 rounded-2xl flex items-center gap-2 border-2 border-gray-200">
                                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={chatQuestion}
                                onChange={(e) => setChatQuestion(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about trumpet technique..."
                                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all"
                                disabled={isChatLoading}
                            />
                            <button
                                onClick={sendChatMessage}
                                disabled={isChatLoading || !chatQuestion.trim()}
                                className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metronome Widget */}
            <MetronomeWidget />

            {/* Recording History Sidebar */}
            <RecordingHistory
                isCollapsed={historyCollapsed}
                onToggle={() => setHistoryCollapsed(!historyCollapsed)}
            />
        </div>
    );
};

export default TrumpetAnalyzer;