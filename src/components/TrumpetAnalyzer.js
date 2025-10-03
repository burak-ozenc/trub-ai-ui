import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mic, MicOff, Send, Upload, Music, MessageCircle, BarChart3, Loader2, User, Settings } from 'lucide-react';

const TrumpetAnalyzer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
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

    // Refs
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const fileInputRef = useRef(null);

    // Recording functions
    const startRecording = async () => {
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

    // File upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            analyzeAudio(file);
        }
    };

    // Analysis function
    const analyzeAudio = async (audioBlob) => {
        if (!guidance.trim()) {
            setError('Please enter a question or guidance text');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const data = await api.analyzeAudio(audioBlob, guidance, 'full');
            setAnalysisResult(data);

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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Recording & Analysis */}
                    <div className="space-y-6">
                        {/* Recording Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mic className="w-5 h-5" />
                                Record & Analyze
                            </h2>

                            {/* Guidance Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Question or Guidance
                                </label>
                                <textarea
                                    value={guidance}
                                    onChange={(e) => setGuidance(e.target.value)}
                                    placeholder="What would you like feedback on? (e.g., 'How is my breathing?', 'Is my tone quality good?')"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Recording Controls */}
                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isAnalyzing}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                                        isRecording
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                                </button>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="audio/*"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isAnalyzing}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload File
                                </button>
                            </div>

                            {/* Status Messages */}
                            {isAnalyzing && (
                                <div className="flex items-center gap-2 text-blue-600 mb-4">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing your performance...
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Analysis Results */}
                        {analysisResult && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Analysis Results
                                </h2>

                                {/* LLM Feedback */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Teacher Feedback</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                            {analysisResult.feedback}
                                        </pre>
                                    </div>
                                </div>

                                {/* Technical Analysis */}
                                {analysisResult.technical_analysis && Object.keys(analysisResult.technical_analysis).length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Technical Analysis</h3>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                            {Object.entries(analysisResult.technical_analysis).map(([key, value]) => (
                                                <div key={key} className="mb-3 last:mb-0">
                                                    <h4 className="font-medium text-gray-700 capitalize mb-1">
                                                        {key.replace('_', ' ')}
                                                    </h4>
                                                    <div className="text-sm text-gray-600">
                                                        {typeof value === 'object' ? (
                                                            <ul className="space-y-1">
                                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                                    <li key={subKey}>
                                                                        <span className="font-medium">{subKey.replace('_', ' ')}:</span> {String(subValue)}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            String(value)
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Practice Recommendations</h3>
                                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                                            <ul className="space-y-2">
                                                {analysisResult.recommendations.map((rec, index) => (
                                                    <li key={index} className="text-sm text-gray-700">
                                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Chat */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Chat with AI Teacher
                        </h2>

                        {/* Chat Messages */}
                        <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4 space-y-3">
                            {chatMessages.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">
                                    Ask me anything about trumpet technique, practice methods, or music theory!
                                </div>
                            ) : (
                                chatMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                message.type === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : message.type === 'error'
                                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                                        : 'bg-gray-100 text-gray-800'
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
                                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={chatQuestion}
                                onChange={(e) => setChatQuestion(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about trumpet technique..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isChatLoading}
                            />
                            <button
                                onClick={sendChatMessage}
                                disabled={isChatLoading || !chatQuestion.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrumpetAnalyzer;