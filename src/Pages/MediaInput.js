import React, { useRef, useState } from "react";

const HighQualityMediaInput = () => {
    const videoRef = useRef(null);
    const [audioStream, setAudioStream] = useState(null);
    const [recorder, setRecorder] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [isRecording, setIsRecording] = useState(false);

    const startRecording = () => {
        if (!audioStream) {
            alert("Please enable the camera and microphone first!");
            return;
        }

        try {
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const audioOnlyStream = new MediaStream(audioStream.getAudioTracks());

            const newRecorder = new MediaRecorder(audioOnlyStream, { mimeType });

            const audioChunks = [];
            newRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            newRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: mimeType });

                // Generate the file name with timestamp
                const fileName = `recording-${Date.now().toString()}.wav`;

                // Send to backend
                await sendAudioToBackend(audioBlob, fileName);

                console.log(`Recording saved as: ${fileName}`);
            };

            newRecorder.start();
            setRecorder(newRecorder);
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting MediaRecorder:", error);
            alert("Recording failed. Please check your browser compatibility or permissions.");
        }
    };



    const stopRecording = () => {
        if (recorder) {
            recorder.stop();
            setIsRecording(false);
        }
    };


    const sendAudioToBackend = async (audioBlob, fileName) => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        const formData = new FormData();
        formData.append("audioData", audioBlob);
        formData.append("fileName", fileName); // Pass the filename

        try {
            const response = await fetch(`${backendUrl}/process-audio`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            setFeedback(result.feedback);
        } catch (error) {
            console.error("Error sending audio to backend:", error);
        }
    };


    const startMedia = async () => {
        try {
            // Request high-quality audio and video
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    sampleRate: 48000, // High sample rate for better audio quality
                    channelCount: 2,  // Stereo recording
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setAudioStream(stream);
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    return (
        <div>
            <h2>High-Quality Media Input</h2>
            <button onClick={startMedia}>Enable Camera & Microphone</button>
            <video ref={videoRef} autoPlay style={{ width: "100%", marginTop: "20px" }} />
            {isRecording ? (
                <button onClick={stopRecording} style={{ marginTop: "20px" }}>
                    Stop Recording
                </button>
            ) : (
                <button onClick={startRecording} style={{ marginTop: "20px" }}>
                    Start Recording
                </button>
            )}
            {feedback && <p style={{ marginTop: "20px" }}>Feedback: {feedback}</p>}
        </div>
    );
};

export default HighQualityMediaInput;
