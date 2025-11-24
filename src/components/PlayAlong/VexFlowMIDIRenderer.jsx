import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { Midi } from '@tonejs/midi';
import { api } from '../../services/api';

/**
 * VexFlow Sheet Music Renderer (v4 Compatible)
 *
 * Fixed imports for VexFlow v4+
 */
const VexFlowMIDIRenderer = ({ songId, difficulty, currentTime = 0, isPlaying = false }) => {
    const containerRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [midiData, setMidiData] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        loadAndRenderMidi();
    }, [songId, difficulty]);

    useEffect(() => {
        if (midiData) {
            renderScore();
        }
    }, [zoom, midiData]);

    useEffect(() => {
        if (isPlaying && autoScroll && midiData) {
            handleAutoScroll();
        }
    }, [currentTime, isPlaying, autoScroll]);

    const loadAndRenderMidi = async () => {
        setLoading(true);
        setError(null);

        try {
            // Use API client for consistent authentication
            const blob = await api.getSongMidi(songId, difficulty);
            const arrayBuffer = await blob.arrayBuffer();

            // Parse MIDI using Tone.js
            const midi = new Midi(arrayBuffer);

            // Convert MIDI to VexFlow format
            const vexFlowData = convertMidiToVexFlow(midi);
            setMidiData(vexFlowData);

        } catch (err) {
            console.error('Error loading MIDI:', err);
            setError('Failed to load sheet music. The MIDI file may be corrupted.');
        } finally {
            setLoading(false);
        }
    };

    const convertMidiToVexFlow = (midi) => {
        try {
            // Get the first track (melody track for trumpet)
            const track = midi.tracks[0];

            if (!track || track.notes.length === 0) {
                throw new Error('No notes found in MIDI file');
            }

            // Convert notes
            const notes = track.notes.map(note => {
                const vfKey = midiNoteToVexFlow(note.midi, note.name);
                const vfDuration = durationToVexFlow(note.duration);

                return {
                    keys: [vfKey],
                    duration: vfDuration,
                    time: note.time,
                    velocity: note.velocity
                };
            });

            return {
                notes: notes,
                tempo: midi.header.tempos[0]?.bpm || 120,
                timeSignature: midi.header.timeSignatures[0] || { numerator: 4, denominator: 4 },
                keySignature: 'C',
                totalDuration: midi.duration
            };
        } catch (err) {
            console.error('Error converting MIDI:', err);
            throw err;
        }
    };

    const midiNoteToVexFlow = (midiNumber, noteName) => {
        const noteMap = {
            'C': 'c', 'C#': 'c#', 'Db': 'db',
            'D': 'd', 'D#': 'd#', 'Eb': 'eb',
            'E': 'e',
            'F': 'f', 'F#': 'f#', 'Gb': 'gb',
            'G': 'g', 'G#': 'g#', 'Ab': 'ab',
            'A': 'a', 'A#': 'a#', 'Bb': 'bb',
            'B': 'b'
        };

        const match = noteName.match(/([A-G][#b]?)(\d+)/);
        if (match) {
            const note = match[1];
            const octave = match[2];
            const vfNote = noteMap[note] || 'c';
            return `${vfNote}/${octave}`;
        }

        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
        return `${noteNames[noteIndex]}/${octave}`;
    };

    const durationToVexFlow = (durationInSeconds) => {
        const quarterNoteDuration = 0.5;
        const quarterNotes = durationInSeconds / quarterNoteDuration;

        if (quarterNotes >= 3.5) return 'w';
        if (quarterNotes >= 1.75) return 'h';
        if (quarterNotes >= 0.875) return 'q';
        if (quarterNotes >= 0.4375) return '8';
        if (quarterNotes >= 0.21875) return '16';
        return '32';
    };

    const renderScore = () => {
        if (!midiData || !containerRef.current) return;

        // Clear previous rendering
        containerRef.current.innerHTML = '';

        // Calculate dimensions
        const containerWidth = containerRef.current.clientWidth || 800;
        const scale = zoom / 100;
        const width = Math.max(containerWidth * scale, 800);
        const notesCount = midiData.notes.length;
        const systemsNeeded = Math.ceil(notesCount / 12);
        const height = Math.max(600, systemsNeeded * 150 + 100);

        try {
            // Create renderer using VexFlow v4 syntax
            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            // Render systems
            const systemWidth = width - 60;
            const notesPerSystem = 12;

            for (let i = 0; i < systemsNeeded; i++) {
                const yPosition = 40 + (i * 150);
                const startIdx = i * notesPerSystem;
                const endIdx = Math.min(startIdx + notesPerSystem, notesCount);
                const systemNotes = midiData.notes.slice(startIdx, endIdx);

                if (systemNotes.length > 0) {
                    renderSystem(
                        context,
                        systemNotes,
                        30,
                        yPosition,
                        systemWidth,
                        i === 0,
                        midiData.timeSignature
                    );
                }
            }
        } catch (err) {
            console.error('Error rendering score:', err);
            setError('Error rendering sheet music: ' + err.message);
        }
    };

    const renderSystem = (context, notes, x, y, width, showClef, timeSignature) => {
        if (!notes || notes.length === 0) return;

        try {
            // Create stave
            const stave = new Stave(x, y, width);

            if (showClef) {
                stave.addClef('treble');
                const timeSig = `${timeSignature.numerator}/${timeSignature.denominator}`;
                stave.addTimeSignature(timeSig);
            } else {
                stave.addClef('treble');
            }

            stave.setContext(context).draw();

            // Create VexFlow notes
            const vfNotes = notes.map(noteData => {
                try {
                    const note = new StaveNote({
                        keys: noteData.keys,
                        duration: noteData.duration,
                        clef: 'treble'
                    });

                    // Add accidentals if needed
                    noteData.keys.forEach((key, idx) => {
                        if (key.includes('#')) {
                            note.addModifier(new Accidental('#'), idx);
                        } else if (key.includes('b')) {
                            note.addModifier(new Accidental('b'), idx);
                        }
                    });

                    return note;
                } catch (err) {
                    console.error('Error creating note:', err);
                    // Return a rest as fallback
                    return new StaveNote({
                        keys: ['b/4'],
                        duration: 'qr',
                        clef: 'treble'
                    });
                }
            });

            // Create voice
            const beatsPerMeasure = timeSignature.numerator;
            const beatValue = timeSignature.denominator;

            const voice = new Voice({
                num_beats: beatsPerMeasure,
                beat_value: beatValue
            });
            voice.setMode(Voice.Mode.SOFT);
            voice.addTickables(vfNotes);

            // Format and draw
            try {
                new Formatter().joinVoices([voice]).format([voice], width - 100);
                voice.draw(context, stave);
            } catch (err) {
                console.error('Error formatting voice:', err);
            }

        } catch (err) {
            console.error('Error rendering system:', err);
        }
    };

    const handleAutoScroll = () => {
        if (!scrollContainerRef.current || !midiData) return;

        const currentNoteIndex = midiData.notes.findIndex(
            note => note.time > currentTime
        );

        if (currentNoteIndex === -1) return;

        const systemHeight = 150;
        const notesPerSystem = 12;
        const currentSystem = Math.floor(currentNoteIndex / notesPerSystem);
        const scrollPosition = Math.max(0, (currentSystem - 1) * systemHeight);

        scrollContainerRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleZoomReset = () => setZoom(100);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">🎼</div>
                <p className="text-gray-600">Loading sheet music...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={loadAndRenderMidi}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    style={{ backgroundColor: '#FF5500' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="vexflow-sheet-music">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleZoomOut}
                        className="px-3 py-1 bg-white rounded hover:bg-gray-200 font-bold"
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <span className="text-sm font-medium min-w-16 text-center">
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="px-3 py-1 bg-white rounded hover:bg-gray-200 font-bold"
                        title="Zoom In"
                    >
                        +
                    </button>
                    <button
                        onClick={handleZoomReset}
                        className="px-3 py-1 bg-white rounded hover:bg-gray-200 text-sm"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                        {midiData?.notes.length} notes • {midiData?.tempo} BPM
                    </span>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded"
                        />
                        Auto-scroll
                    </label>
                </div>
            </div>

            {/* Sheet Music Container */}
            <div
                ref={scrollContainerRef}
                className="sheet-music-scroll-container border-2 border-gray-200 rounded-lg bg-white overflow-auto shadow-inner"
                style={{ height: '550px' }}
            >
                <div ref={containerRef} className="p-6" />
            </div>

            {/* Info Footer */}
            <div className="mt-3 text-xs text-gray-500 text-center">
                💡 Sheet music scrolls automatically during playback
            </div>
        </div>
    );
};

export default VexFlowMIDIRenderer;