import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../services/api';
import Header from '../components/Common/Header';
import TunerWidget from '../components/Analyzer/TunerWidget';
import MetronomeSidebar from '../components/Analyzer/MetronomeSidebar';
import SyncedVexFlowRenderer from '../components/PlayAlong/SyncedVexFlowRenderer';
import useTuner from '../hooks/useTuner';
import { validateNote } from '../utils/noteValidator';
import { findNoteAtTime, findNoteIndexAtTime, convertMidiNoteToExpected } from '../utils/midiHelper';
import {
    initializePlayback,
    setPlaying,
    updateCurrentTime,
    setDuration,
    setTempo,
    resetPlayback,
    setPlayMode,
    togglePlayMode,
    setCurrentNoteIndex,
    setExpectedNote,
    setNoteStartTime,
    updateDetectedPitch,
    setCurrentNoteResult,
    addNoteResult,
    advanceToNextNote,
    setRecording,
    selectPlaybackState,
    selectPlayMode,
    selectCurrentNoteIndex,
    selectNoteStartTime,
    selectSessionStats,
    selectNoteResults
} from '../store/slices/playbackSlice';

const PlayAlongPage = () => {
    const { songId, difficulty } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const playbackState = useSelector(selectPlaybackState);
    const playMode = useSelector(selectPlayMode);
    const currentNoteIndex = useSelector(selectCurrentNoteIndex);
    const noteStartTime = useSelector(selectNoteStartTime);
    const sessionStats = useSelector(selectSessionStats);
    const noteResults = useSelector(selectNoteResults);

    const { isPlaying, currentTime, duration, tempo } = playbackState;

    // Local state
    const [song, setSong] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [midiNotes, setMidiNotes] = useState([]);
    const [expectedNotes, setExpectedNotes] = useState([]);
    const [user, setUser] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    // Wait mode specific state
    const [userPlayStartTime, setUserPlayStartTime] = useState(null); // When user started playing current note correctly

    // Hooks
    const tuner = useTuner(user?.skill_level || 'intermediate');

    // Refs
    const audioRef = useRef(null);
    const animationFrameRef = useRef(null);
    const lastNoteIndexRef = useRef(-1);
    const validationTimeoutRef = useRef(null);

    useEffect(() => {
        loadSongAndStartSession();
        loadUserProfile();

        return () => {
            dispatch(resetPlayback());
            tuner.stop();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
            // Cleanup blob URL
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [songId, difficulty]);

    // Set audio source when both audioUrl and audioRef are ready
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            console.log('🎵 Setting audio src:', audioUrl);
            audioRef.current.src = audioUrl;
            audioRef.current.load();
            console.log('✅ Audio element loaded and ready');
        }
    }, [audioUrl]);

    const loadUserProfile = async () => {
        try {
            const userData = await api.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const loadSongAndStartSession = async () => {
        setLoading(true);
        try {
            console.log('🎵 Loading song:', songId, 'difficulty:', difficulty);

            const songData = await api.getSongDetails(songId);
            console.log('✅ Song data loaded:', songData);
            setSong(songData);

            const sessionData = await api.startPlayAlongSession(parseInt(songId), difficulty);
            console.log('✅ Session started:', sessionData);
            setSession(sessionData);

            console.log('🎧 Fetching backing track...');
            const backingTrack = await api.getSongBackingTrack(songId);
            console.log('✅ Backing track blob received:', backingTrack.type, backingTrack.size, 'bytes');

            if (backingTrack.size === 0) {
                throw new Error('Backing track is empty');
            }

            const blobUrl = URL.createObjectURL(backingTrack);
            console.log('✅ Blob URL created:', blobUrl);

            // Store URL in state - will be set on audio element after loading completes
            setAudioUrl(blobUrl);
            console.log('✅ Audio URL stored in state, will be applied when component renders');

        } catch (error) {
            console.error('❌ Error loading song:', error);
            console.error('Error details:', error.message, error.stack);
            alert(`Failed to load song: ${error.message}\n\nPlease check console for details.`);
            navigate('/songs');
        } finally {
            setLoading(false);
        }
    };

    // FIX: Called when MIDI is loaded by SyncedVexFlowRenderer
    const handleMidiLoaded = (notes) => {
        console.log('🎵 MIDI Loaded callback received with', notes.length, 'notes');
        console.log('First note:', notes[0]);

        // Convert MIDI notes to expected format
        const converted = notes.map((note, index) =>
            convertMidiNoteToExpected(note, index)
        );

        console.log('✅ Converted notes:', converted.length);
        console.log('First converted note:', converted[0]);

        setMidiNotes(notes);
        setExpectedNotes(converted);

        // Initialize Redux playback state
        const totalDuration = converted[converted.length - 1]?.endTime || 180;

        console.log('📊 Initializing playback:', {
            sessionId: session?.session_id,
            songId: parseInt(songId),
            difficulty,
            duration: totalDuration,
            totalNotes: converted.length
        });

        dispatch(initializePlayback({
            sessionId: session?.session_id,
            songId: parseInt(songId),
            difficulty: difficulty,
            duration: totalDuration,
            totalNotes: converted.length
        }));
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                // Pause
                audioRef.current.pause();
                dispatch(setPlaying(false));
                tuner.stop();

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                // Reset wait mode timer
                setUserPlayStartTime(null);
            } else {
                // Play
                console.log('▶️ Starting playback, expectedNotes:', expectedNotes.length);
                console.log('▶️ Mode:', playMode);

                
                audioRef.current.play();
                dispatch(setPlaying(true));
                tuner.start();
                startTimeTracking();

                // In wait mode, pause immediately after starting to wait for user input
                if (playMode === 'wait') {
                    setTimeout(() => {
                        if (audioRef.current && !audioRef.current.paused) {
                            console.log('⏸️ Wait mode: pausing at start, waiting for user input');
                            audioRef.current.pause();
                        }
                    }, 100); // Small delay to let audio element initialize
                }
            }
        }
    };

    const startTimeTracking = () => {
        const updateTime = () => {
            if (audioRef.current && !audioRef.current.paused) {
                const time = audioRef.current.currentTime;
                dispatch(updateCurrentTime(time));

                // Continue loop
                animationFrameRef.current = requestAnimationFrame(updateTime);
            }
        };

        animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    // FIX: Real-time validation loop with better logging
    useEffect(() => {
        if (!isPlaying || expectedNotes.length === 0) {
            if (isPlaying && expectedNotes.length === 0) {
                console.warn('⚠️ Playing but no expected notes loaded!');
            }
            return;
        }

        performRealtimeValidation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentTime, tuner.note, tuner.octave, tuner.frequency, tuner.cents, tuner.isDetecting, expectedNotes, playMode, noteStartTime, user, noteResults, userPlayStartTime]);

    const performRealtimeValidation = () => {
        // FIX: Find expected note at current time
        const noteIndex = findNoteIndexAtTime(currentTime, expectedNotes);
        const expectedNote = noteIndex >= 0 ? expectedNotes[noteIndex] : null;

        // DEBUG: Log every second
        if (Math.floor(currentTime) !== Math.floor(currentTime - 0.016)) {
            console.log('🕐 Validation:', {
                currentTime: currentTime.toFixed(2),
                noteIndex,
                expectedNote: expectedNote ? `${expectedNote.pitch} (${expectedNote.startTime.toFixed(2)}-${expectedNote.endTime.toFixed(2)})` : 'none',
                totalNotes: expectedNotes.length
            });
        }

        // Update current note index if changed
        if (noteIndex !== lastNoteIndexRef.current) {
            console.log('🔄 Note changed:', lastNoteIndexRef.current, '→', noteIndex);

            if (noteIndex >= 0) {
                dispatch(setCurrentNoteIndex(noteIndex));
                dispatch(setExpectedNote(expectedNote));
                dispatch(setNoteStartTime(currentTime));

                // Reset wait mode timer when note changes
                setUserPlayStartTime(null);
            } else {
                // Between notes or before first note
                dispatch(setCurrentNoteIndex(-1));
                dispatch(setExpectedNote(null));

                // Reset wait mode timer
                setUserPlayStartTime(null);
            }

            lastNoteIndexRef.current = noteIndex;
        }

        if (!expectedNote) return;

        // Update detected pitch in Redux
        dispatch(updateDetectedPitch({
            note: tuner.note,
            octave: tuner.octave,
            frequency: tuner.frequency,
            cents: tuner.cents,
            isDetecting: tuner.isDetecting,
            audioLevel: tuner.audioLevel
        }));

        // Validate note
        const validation = validateNote(
            expectedNote,
            {
                note: tuner.note,
                octave: tuner.octave,
                frequency: tuner.frequency,
                cents: tuner.cents,
                isDetecting: tuner.isDetecting,
                audioLevel: tuner.audioLevel
            },
            currentTime,
            noteStartTime || currentTime,
            user?.skill_level || 'intermediate'
        );

        // Update current validation result
        dispatch(setCurrentNoteResult(validation));

        // Handle mode-specific logic
        if (playMode === 'wait') {
            handleWaitMode(validation, expectedNote, noteIndex);
        } else {
            handleFlowMode(validation, expectedNote, noteIndex);
        }
    };

    const handleWaitMode = (validation, expectedNote, noteIndex) => {
        // In wait mode, pause until correct note with correct duration is played

        const currentTime = playbackState.currentTime;
        const pitchCorrect = validation.result === 'correct' || validation.result === 'close';

        // STEP 1: Track when user starts playing the correct note
        const isDetecting = tuner.isDetecting || false;

        if (pitchCorrect && userPlayStartTime === null && isDetecting) {
            // User just started playing the correct note - record the time
            setUserPlayStartTime(currentTime);
            console.log('🎵 User started playing correct note at:', currentTime);

            // Pause the backing track
            if (audioRef.current && !audioRef.current.paused) {
                console.log('⏸️ Pausing backing track');
                audioRef.current.pause();
            }
        }

        // STEP 2: Reset timer if user stops playing or plays wrong note
        if (!pitchCorrect && userPlayStartTime !== null) {
            console.log('❌ User stopped playing correctly, resetting timer');
            setUserPlayStartTime(null);
        }

        // STEP 3: Calculate progress
        const requiredDuration = expectedNote.duration;
        let heldDuration = 0;
        let durationProgress = 0;

        if (pitchCorrect && userPlayStartTime !== null) {
            heldDuration = currentTime - userPlayStartTime;
            durationProgress = Math.min(heldDuration / requiredDuration, 1.0);
        }

        // Duration requirement: Hold for at least 80% of the required duration
        const minDuration = requiredDuration * 0.8;
        const durationMet = heldDuration >= minDuration;

        // STEP 4: Update feedback based on state
        if (pitchCorrect && userPlayStartTime !== null) {
            const progressPercent = Math.min(Math.round(durationProgress * 100), 100);

            if (durationMet) {
                // SUCCESS: Correct pitch held long enough
                console.log('✅ Success in Wait Mode! Note completed:', noteIndex);

                // Save result
                if (!noteResults.find(r => r.index === noteIndex)) {
                    dispatch(addNoteResult({
                        index: noteIndex,
                        ...validation,
                        durationHeld: heldDuration
                    }));
                }

                // Reset user play timer
                setUserPlayStartTime(null);

                // Resume playback
                if (audioRef.current && audioRef.current.paused) {
                    console.log('▶️ Resuming audio...');
                    audioRef.current.play();
                }

                // Advance to next note
                dispatch(advanceToNextNote());

                return; // Exit early to prevent further updates this cycle
            } else {
                // Still holding - show progress
                dispatch(setCurrentNoteResult({
                    ...validation,
                    result: 'correct',
                    feedback: `Hold it... ${progressPercent}%`,
                    progress: durationProgress
                }));
            }
        } else if (!isDetecting || !pitchCorrect) {
            // User not playing or playing wrong note

            // Make sure audio is paused in wait mode
            if (audioRef.current && !audioRef.current.paused) {
                console.log('⏸️ Pausing - waiting for correct note');
                audioRef.current.pause();
            }

            if (isDetecting && !pitchCorrect) {
                // Playing wrong note
                dispatch(setCurrentNoteResult({
                    ...validation,
                    result: 'wrong',
                    feedback: `Play ${expectedNote.pitch}`,
                    progress: 0
                }));
            } else {
                // Silent - waiting for input
                dispatch(setCurrentNoteResult({
                    result: 'silent',
                    feedback: `Play ${expectedNote.pitch}`,
                    accuracy: 0,
                    progress: 0
                }));
            }
        }

        // Debug logging (throttled)
        if (Math.random() < 0.1) { // Log ~10% of the time to avoid spam
            console.log('⏸️ Wait Mode:', {
                pitch: validation.result,
                heldDuration: heldDuration.toFixed(2),
                required: requiredDuration.toFixed(2),
                progress: (durationProgress * 100).toFixed(0) + '%',
                durationMet,
                userPlayStartTime: userPlayStartTime !== null,
                isPaused: audioRef.current?.paused
            });
        }
    };

    const handleFlowMode = (validation, expectedNote, noteIndex) => {
        // In flow mode, just track results continuously
        // Check if note has ended
        if (currentTime >= expectedNote.endTime) {
            // Note ended - save final result if not already saved
            const existingResult = noteResults.find(r => r.index === noteIndex);

            if (!existingResult) {
                console.log('💾 Saving result for note', noteIndex, ':', validation.result);
                dispatch(addNoteResult({
                    index: noteIndex,
                    ...validation
                }));
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            const dur = audioRef.current.duration;
            dispatch(setDuration(dur));
            console.log('🎵 Audio loaded, duration:', dur);
        }
    };

    const handleEnded = () => {
        console.log('🏁 Audio ended');
        dispatch(setPlaying(false));
        tuner.stop();

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Auto-complete session
        setTimeout(() => {
            handleComplete();
        }, 1000);
    };

    const handleTempoChange = (newTempo) => {
        dispatch(setTempo(newTempo));
        if (audioRef.current) {
            audioRef.current.playbackRate = newTempo / 100;
        }
    };

    const handleSeek = (e) => {
        const seekTime = (e.target.value / 100) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            dispatch(updateCurrentTime(seekTime));
        }
    };

    const handleModeToggle = () => {
        console.log('🔄 Toggling mode from', playMode);
        dispatch(togglePlayMode());
    };

    const handleComplete = async () => {
        try {
            await api.submitPerformance(session.session_id, {
                pitch_accuracy: sessionStats.pitchAccuracy,
                rhythm_accuracy: sessionStats.durationAccuracy,
                total_score: sessionStats.overallAccuracy,
                duration_seconds: Math.floor(currentTime)
            });

            const message = `
Session Complete! 🎺

Overall Score: ${sessionStats.overallAccuracy}/100

✓ Correct: ${sessionStats.correctNotes}
≈ Close: ${sessionStats.closeNotes}
✗ Wrong: ${sessionStats.wrongNotes}
○ Silent: ${sessionStats.silentNotes}

Pitch Accuracy: ${sessionStats.pitchAccuracy}%
Duration Accuracy: ${sessionStats.durationAccuracy}%
            `.trim();

            alert(message);
            navigate('/songs');

        } catch (error) {
            console.error('Error submitting performance:', error);
            alert('Session complete! Failed to save results.');
            navigate('/songs');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🎺</div>
                    <p className="text-xl text-gray-600">Loading song...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-peach-50 to-teal-50">
            <Header />

            <div className="container mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/songs')}
                        className="text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-2"
                    >
                        ← Back to Song Library
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {song?.title}
                            </h1>
                            <p className="text-gray-600">
                                {song?.composer || song?.artist} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • {song?.tempo} BPM
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Practice Mode:</span>
                            <button
                                onClick={handleModeToggle}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    playMode === 'wait'
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                }`}
                            >
                                {playMode === 'wait' ? '⏸ Wait Mode' : '▶ Flow Mode'}
                            </button>
                            <div className="text-xs text-gray-500 max-w-xs">
                                {playMode === 'wait'
                                    ? 'Pauses until you play each note correctly'
                                    : 'Plays continuously, scoring as you go'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Info (remove after testing) */}
                <div className="mb-4 p-3 bg-yellow-100 rounded text-xs font-mono">
                    Debug: currentTime={currentTime.toFixed(2)} | currentNoteIndex={currentNoteIndex} |
                    expectedNotes={expectedNotes.length} | mode={playMode} |
                    tuner={tuner.isDetecting ? `${tuner.note}${tuner.octave}` : 'silent'}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Sheet Music & Controls */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Sheet Music Viewer */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    🎼 Sheet Music
                                </h3>

                                {/* Simple Expected Note Display */}
                                {isPlaying && playbackState.expectedNote && currentNoteIndex >= 0 && (
                                    <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 rounded-lg border-2 border-orange-200">
                                        <span className="text-sm text-gray-600">Now:</span>
                                        <span className="text-2xl font-bold text-orange-600">
                                            {playbackState.expectedNote.pitch}
                                        </span>
                                    </div>
                                )}

                                {/* Live Feedback Indicator - Simple & Gentle */}
                                {playbackState.currentNoteResult && currentNoteIndex >= 0 && (
                                    <div className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        playbackState.currentNoteResult.result === 'correct' ? 'bg-green-100 text-green-700' :
                                            playbackState.currentNoteResult.result === 'close' ? 'bg-yellow-100 text-yellow-700' :
                                                playbackState.currentNoteResult.result === 'wrong' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-500'
                                    }`}>
                                        {playbackState.currentNoteResult.feedback}
                                    </div>
                                )}
                            </div>

                            <SyncedVexFlowRenderer
                                songId={songId}
                                difficulty={difficulty}
                                onMidiLoaded={handleMidiLoaded}
                            />
                        </div>

                        {/* Audio Controls */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                🎵 Playback Controls
                            </h3>

                            {/* Audio Element */}
                            <audio
                                ref={audioRef}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={handleEnded}
                            />

                            {/* Play/Pause Button */}
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={handlePlayPause}
                                    disabled={!song || expectedNotes.length === 0}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-lg transition-all"
                                    style={{ backgroundColor: isPlaying ? '#ef4444' : '#FF5500' }}
                                >
                                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                                </button>

                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={(currentTime / duration) * 100 || 0}
                                        onChange={handleSeek}
                                        className="w-full"
                                        style={{ accentColor: '#FF5500' }}
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tempo Control */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 min-w-24">
                                    Tempo: {tempo}%
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="150"
                                    value={tempo}
                                    onChange={(e) => handleTempoChange(parseInt(e.target.value))}
                                    className="flex-1"
                                    style={{ accentColor: '#14b8a6' }}
                                />
                                <button
                                    onClick={() => handleTempoChange(100)}
                                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Live Feedback Stats */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                📊 Live Performance Stats
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                    <div className="text-3xl font-bold mb-1" style={{ color: '#10b981' }}>
                                        {sessionStats.correctNotes}
                                    </div>
                                    <div className="text-sm text-gray-600">Correct</div>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-3xl font-bold mb-1" style={{ color: '#f59e0b' }}>
                                        {sessionStats.closeNotes}
                                    </div>
                                    <div className="text-sm text-gray-600">Close</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-3xl font-bold mb-1" style={{ color: '#ef4444' }}>
                                        {sessionStats.wrongNotes}
                                    </div>
                                    <div className="text-sm text-gray-600">Wrong</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-3xl font-bold mb-1" style={{ color: '#FF5500' }}>
                                        {sessionStats.overallAccuracy}
                                    </div>
                                    <div className="text-sm text-gray-600">Score</div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">
                                        {sessionStats.pitchAccuracy}%
                                    </div>
                                    <div className="text-xs text-gray-600">Pitch Accuracy</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xl font-bold text-purple-600">
                                        {sessionStats.durationAccuracy}%
                                    </div>
                                    <div className="text-xs text-gray-600">Duration Accuracy</div>
                                </div>
                            </div>
                        </div>

                        {/* Complete Button */}
                        <button
                            onClick={handleComplete}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                            style={{ backgroundColor: '#10b981' }}
                        >
                            ✓ Complete Session
                        </button>
                    </div>

                    {/* Right Sidebar: Tools */}
                    <div className="space-y-4">
                        {/* Tuner */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                🎯 Tuner
                            </h3>
                            <TunerWidget
                                skillLevel={user?.skill_level || 'intermediate'}
                                isMinimized={false}
                            />
                        </div>

                        {/* Metronome */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                ⏱️ Metronome
                            </h3>
                            <MetronomeSidebar defaultBpm={song?.tempo || 120} />
                        </div>

                        {/* Practice Tips */}
                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold mb-4" style={{ color: '#FF5500' }}>
                                💡 Tips
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• {playMode === 'wait' ? 'Play each note correctly to advance' : 'Play along continuously'}</li>
                                <li>• Watch the live feedback above the notes</li>
                                <li>• Green = Perfect, Yellow = Close, Red = Off</li>
                                <li>• Start slow and gradually increase tempo</li>
                                <li>• Focus on steady breath support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayAlongPage;