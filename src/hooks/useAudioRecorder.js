import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setError('');

            return { success: true };
        } catch (err) {
            const errorMessage = 'Error accessing microphone: ' + err.message;
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const stopRecording = () => {
        return new Promise((resolve) => {
            if (mediaRecorder.current && isRecording) {
                mediaRecorder.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                    audioChunks.current = [];

                    // Stop all tracks
                    if (mediaRecorder.current && mediaRecorder.current.stream) {
                        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
                    }

                    resolve(audioBlob);
                };

                mediaRecorder.current.stop();
                setIsRecording(false);
            } else {
                resolve(null);
            }
        });
    };

    const clearError = () => setError('');

    return {
        isRecording,
        error,
        startRecording,
        stopRecording,
        clearError
    };
};