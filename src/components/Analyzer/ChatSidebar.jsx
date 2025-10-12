import React from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

const ChatSidebar = ({
                         messages,
                         question,
                         isLoading,
                         onQuestionChange,
                         onSend,
                         onKeyPress
                     }) => {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                    AI Teacher
                </h2>
                <p className="text-xs text-gray-600 mt-1">Ask anything about trumpet technique</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-400 text-sm">
                            Ask me about breathing techniques, embouchure, tone production, or practice strategies!
                        </p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                                    message.type === 'user'
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                        : message.type === 'error'
                                            ? 'bg-red-100 text-red-700 border border-red-200'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                <pre className="whitespace-pre-wrap font-sans">
                                    {message.content}
                                </pre>
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                            <span className="text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => onQuestionChange(e.target.value)}
                        onKeyPress={onKeyPress}
                        placeholder="Ask a question..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={onSend}
                        disabled={isLoading || !question.trim()}
                        className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatSidebar;