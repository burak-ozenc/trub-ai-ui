import { useState } from 'react';
import { api } from '../services/api';

export const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (question) => {
        if (!question.trim()) return;

        // Add user message
        const userMessage = { type: 'user', content: question };
        setMessages(prev => [...prev, userMessage]);

        setIsLoading(true);

        try {
            const data = await api.askQuestion(question);
            const botMessage = { type: 'bot', content: data.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = {
                type: 'error',
                content: 'Failed to get response: ' + err.message
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => setMessages([]);

    return {
        messages,
        isLoading,
        sendMessage,
        clearMessages
    };
};