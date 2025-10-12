import { useState, useRef, useCallback, useEffect } from 'react';

const useTuner = (skillLevel = 'intermediate') => {
    const [isActive, setIsActive] = useState(false);
    const [note, setNote] = useState('A');  // Default A4
    const [octave, setOctave] = useState(4);  // Default A4
    const [frequency, setFrequency] = useState(440);  // Default 440Hz
    const [cents, setCents] = useState(0);  // Default in tune
    const [stability, setStability] = useState([]);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const bufferRef = useRef(null);
    const smoothedCentsRef = useRef(0);  // For smoothing

    // Note names
    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Tolerance zones based on skill level
    const toleranceZones = {
        beginner: 15,
        intermediate: 10,
        advanced: 5
    };

    const tolerance = toleranceZones[skillLevel] || 10;

    // Convert frequency to note
    const frequencyToNote = useCallback((frequency) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        const noteIndex = Math.round(noteNum) + 69;
        const noteName = noteStrings[noteIndex % 12];
        const octave = Math.floor(noteIndex / 12) - 1;
        const cents = Math.floor((noteNum - Math.round(noteNum)) * 100);

        return { noteName, octave, cents, noteIndex };
    }, []);

    // Get target frequency for a note
    const getTargetFrequency = useCallback((noteIndex) => {
        return 440 * Math.pow(2, (noteIndex - 69) / 12);
    }, []);

    // Autocorrelation pitch detection
    const autoCorrelate = useCallback((buffer, sampleRate) => {
        const SIZE = buffer.length;
        const MAX_SAMPLES = Math.floor(SIZE / 2);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;

        // Calculate RMS (volume check)
        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);

        // Not enough signal
        if (rms < 0.01) return -1;

        // Find best correlation
        let lastCorrelation = 1;
        for (let offset = 1; offset < MAX_SAMPLES; offset++) {
            let correlation = 0;

            for (let i = 0; i < MAX_SAMPLES; i++) {
                correlation += Math.abs(buffer[i] - buffer[i + offset]);
            }

            correlation = 1 - correlation / MAX_SAMPLES;

            if (correlation > 0.9 && correlation > lastCorrelation) {
                const foundGoodCorrelation = correlation > best_correlation;
                if (foundGoodCorrelation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            }

            lastCorrelation = correlation;
        }

        if (best_correlation > 0.01) {
            return sampleRate / best_offset;
        }

        return -1;
    }, []);

    // Update pitch detection
    const updatePitch = useCallback(() => {
        if (!analyserRef.current || !bufferRef.current) return;

        analyserRef.current.getFloatTimeDomainData(bufferRef.current);
        const frequency = autoCorrelate(bufferRef.current, audioContextRef.current.sampleRate);

        if (frequency > 0 && frequency < 2000) {
            const noteData = frequencyToNote(frequency);
            setNote(noteData.noteName);
            setOctave(noteData.octave);
            setFrequency(Math.round(frequency * 10) / 10);
            setCents(noteData.cents);

            // Update stability history (last 5 seconds, ~150 samples at 30fps)
            setStability(prev => {
                const newHistory = [...prev, noteData.cents];
                return newHistory.slice(-150);
            });
        }

        animationFrameRef.current = requestAnimationFrame(updatePitch);
    }, [autoCorrelate, frequencyToNote]);

    // Start tuner
    const start = useCallback(async () => {
        try {
            // Initialize audio context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Create analyser
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 2048;
            const bufferLength = analyser.fftSize;
            const buffer = new Float32Array(bufferLength);

            analyserRef.current = analyser;
            bufferRef.current = buffer;

            // Connect stream to analyser
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyser);

            setIsActive(true);
            updatePitch();
        } catch (error) {
            console.error('Error starting tuner:', error);
            alert('Could not access microphone. Please allow microphone access.');
        }
    }, [updatePitch]);

    // Stop tuner
    const stop = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setIsActive(false);
        setNote(null);
        setOctave(null);
        setFrequency(0);
        setCents(0);
        setStability([]);
    }, []);

    // Toggle tuner
    const toggle = useCallback(() => {
        if (isActive) {
            stop();
        } else {
            start();
        }
    }, [isActive, start, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Determine if in tune
    const isInTune = Math.abs(cents) <= tolerance;

    // Get status color
    const getStatusColor = () => {
        if (!note) return 'gray';
        if (Math.abs(cents) <= tolerance) return 'green';
        if (Math.abs(cents) <= tolerance * 2) return 'yellow';
        return 'red';
    };

    // Get target frequency for current note
    const targetFrequency = note && octave
        ? Math.round(getTargetFrequency(noteStrings.indexOf(note) + (octave + 1) * 12) * 10) / 10
        : null;

    return {
        isActive,
        note,
        octave,
        frequency,
        cents,
        targetFrequency,
        stability,
        isInTune,
        statusColor: getStatusColor(),
        tolerance,
        start,
        stop,
        toggle
    };
};

export default useTuner;