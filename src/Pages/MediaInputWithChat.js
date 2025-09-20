import React, { useState, useRef } from 'react';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState('');
    const [guidance, setGuidance] = useState('');
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
                await sendAudioToServer(audioBlob);
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
        }
    };

    const sendAudioToServer = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audioData', audioBlob);
        formData.append('guidance', guidance);

        try {
            const response = await fetch('http://localhost:8000/process-audio', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Server error');

            const data = await response.json();
            setFeedback(data.feedback);
        } catch (err) {
            setError('Error sending audio: ' + err.message);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={guidance}
                    onChange={(e) => setGuidance(e.target.value)}
                    placeholder="Enter your question or guidance"
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginBottom: '10px'
                    }}
                />

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                        backgroundColor: isRecording ? '#dc2626' : '#2563eb',
                        color: 'white',
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '10px'
                }}>
                    {error}
                </div>
            )}

            {feedback && (
                <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '16px',
                    borderRadius: '4px'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Analysis Results:</h3>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{feedback}</pre>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;