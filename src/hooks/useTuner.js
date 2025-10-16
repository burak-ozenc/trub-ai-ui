import { useState, useRef, useCallback, useEffect } from 'react';

const useTuner = (skillLevel = 'intermediate') => {
    const [isActive, setIsActive] = useState(false);
    const [note, setNote] = useState('A');
    const [octave, setOctave] = useState(4);
    const [frequency, setFrequency] = useState(440);
    const [cents, setCents] = useState(0);
    const [stability, setStability] = useState([]);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isDetecting, setIsDetecting] = useState(false);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const bufferRef = useRef(null);

    const smoothedFrequencyRef = useRef(440);
    const smoothedCentsRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);
    const lastNoteRef = useRef('A'); // Track last note for smoother transitions

    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    const toleranceZones = {
        beginner: 15,
        intermediate: 10,
        advanced: 5
    };

    const tolerance = toleranceZones[skillLevel] || 10;

    const frequencyToNote = useCallback((frequency) => {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        const noteIndex = Math.round(noteNum) + 69;
        const noteName = noteStrings[noteIndex % 12];
        const octave = Math.floor(noteIndex / 12) - 1;
        const cents = Math.floor((noteNum - Math.round(noteNum)) * 100);

        return { noteName, octave, cents, noteIndex };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTargetFrequency = useCallback((noteIndex) => {
        return 440 * Math.pow(2, (noteIndex - 69) / 12);
    }, []);

    const autoCorrelate = useCallback((buffer, sampleRate) => {
        const SIZE = buffer.length;
        const MAX_SAMPLES = Math.floor(SIZE / 2);
        let best_offset = -1;
        let best_correlation = 0;
        let rms = 0;

        for (let i = 0; i < SIZE; i++) {
            const val = buffer[i];
            rms += val * val;
        }
        rms = Math.sqrt(rms / SIZE);

        setAudioLevel(Math.min(rms * 20, 1));

        if (rms < 0.05) {
            setIsDetecting(false);
            return -1;
        }

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

        if (best_correlation > 0.1) {
            setIsDetecting(true);
            return sampleRate / best_offset;
        }

        setIsDetecting(false);
        return -1;
    }, []);

    const updatePitch = useCallback(() => {
        if (!analyserRef.current || !bufferRef.current) return;

        const now = performance.now();

        if (now - lastUpdateTimeRef.current < 33) {
            animationFrameRef.current = requestAnimationFrame(updatePitch);
            return;
        }

        lastUpdateTimeRef.current = now;

        analyserRef.current.getFloatTimeDomainData(bufferRef.current);
        const detectedFrequency = autoCorrelate(bufferRef.current, audioContextRef.current.sampleRate);

        if (detectedFrequency > 0 && detectedFrequency < 2000) {
            const smoothingFactor = 0.15;
            smoothedFrequencyRef.current =
                smoothedFrequencyRef.current * (1 - smoothingFactor) +
                detectedFrequency * smoothingFactor;

            const noteData = frequencyToNote(smoothedFrequencyRef.current);

            smoothedCentsRef.current =
                smoothedCentsRef.current * (1 - smoothingFactor) +
                noteData.cents * smoothingFactor;

            const freqDiff = Math.abs(frequency - smoothedFrequencyRef.current);
            const centsDiff = Math.abs(cents - smoothedCentsRef.current);
            const noteChanged = note !== noteData.noteName;

            // Only update if significant change OR note actually changed
            // More lenient for note changes to make transitions softer
            if (freqDiff > 0.5 || centsDiff > 0.5 || (noteChanged && lastNoteRef.current !== noteData.noteName)) {
                setNote(noteData.noteName);
                setOctave(noteData.octave);
                setFrequency(Math.round(smoothedFrequencyRef.current * 10) / 10);
                setCents(Math.round(smoothedCentsRef.current));

                lastNoteRef.current = noteData.noteName;

                setStability(prev => {
                    const newHistory = [...prev, Math.round(smoothedCentsRef.current)];
                    return newHistory.slice(-150);
                });
            }
        } else {
            // When sound stops, gently transition back to A4
            // Use slower smoothing to avoid jarring return
            if (isDetecting) {
                smoothedFrequencyRef.current = smoothedFrequencyRef.current * 0.95 + 440 * 0.05;
                smoothedCentsRef.current = smoothedCentsRef.current * 0.9;
            }
        }

        animationFrameRef.current = requestAnimationFrame(updatePitch);
    }, [autoCorrelate, frequencyToNote, frequency, cents, note, isDetecting]);

    const start = useCallback(async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            streamRef.current = stream;

            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 4096;
            analyser.smoothingTimeConstant = 0.8;
            const bufferLength = analyser.fftSize;
            const buffer = new Float32Array(bufferLength);

            analyserRef.current = analyser;
            bufferRef.current = buffer;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyser);

            smoothedFrequencyRef.current = 440;
            smoothedCentsRef.current = 0;
            lastUpdateTimeRef.current = performance.now();
            lastNoteRef.current = 'A';

            setIsActive(true);
            updatePitch();
        } catch (error) {
            console.error('Error starting tuner:', error);
            alert('Could not access microphone. Please allow microphone access.');
        }
    }, [updatePitch]);

    const stop = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setIsActive(false);
        setNote('A');
        setOctave(4);
        setFrequency(440);
        setCents(0);
        setStability([]);
        setAudioLevel(0);
        setIsDetecting(false);

        smoothedFrequencyRef.current = 440;
        smoothedCentsRef.current = 0;
        lastNoteRef.current = 'A';
    }, []);

    const toggle = useCallback(() => {
        if (isActive) {
            stop();
        } else {
            start();
        }
    }, [isActive, start, stop]);

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

    const isInTune = Math.abs(cents) <= tolerance;

    const getStatusColor = () => {
        if (!isDetecting) return 'gray';
        if (Math.abs(cents) <= tolerance) return 'green';
        if (Math.abs(cents) <= tolerance * 2) return 'yellow';
        return 'red';
    };

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
        audioLevel,
        isDetecting,
        start,
        stop,
        toggle
    };
};

export default useTuner;