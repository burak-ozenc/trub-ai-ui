import React, { useState } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

const ChatInterface = ({ messages, isLoading, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = () => {
        if (!inputValue.trim() || isLoading) return;

        onSendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat with AI Teacher
            </h2>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto border border-gray-200 rounded-md p-4 mb-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        Ask me anything about trumpet technique, practice methods, or music theory!
                    </div>
                ) : (
                    messages.map((message, index) => (
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

                {isLoading && (
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
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about trumpet technique..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;