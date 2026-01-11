import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { Midi } from '@tonejs/midi';
import { api } from '../../services/api';
import {
    selectCurrentNoteIndex,
    selectNoteResults,
    selectIsPlaying
} from '../../store/slices/playbackSlice';

/**
 * Synced VexFlow Sheet Music Renderer with Note Coloring - FIXED VERSION
 */
const SyncedVexFlowRenderer = ({ songId, difficulty, onMidiLoaded }) => {
    const containerRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const noteElementsRef = useRef([]);
    const noteStemsRef = useRef([]);

    // Redux state
    const currentNoteIndex = useSelector(selectCurrentNoteIndex);
    const noteResults = useSelector(selectNoteResults);
    const isPlaying = useSelector(selectIsPlaying);
    const playbackState = useSelector(state => state.playback);

    // Local state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [midiData, setMidiData] = useState(null);
    const [zoom, setZoom] = useState(100);
    const [autoScroll, setAutoScroll] = useState(true);

    // Refs for visual overlays
    const highlightBoxRef = useRef(null);
    const progressBarRef = useRef(null);

    useEffect(() => {
        loadAndRenderMidi();
    }, [songId, difficulty]);

    useEffect(() => {
        if (midiData) {
            renderScore();
        }
    }, [zoom, midiData]);

    // Color notes based on validation results
    useEffect(() => {
        if (noteResults.length > 0 && noteElementsRef.current.length > 0) {
            console.log('🎨 Coloring notes, results:', noteResults.length, 'elements:', noteElementsRef.current.length);
            colorNotesBasedOnResults();
        }
    }, [noteResults]);

    // Highlight current note
    useEffect(() => {
        if (currentNoteIndex >= 0 && noteElementsRef.current.length > 0) {
            console.log('🎯 Highlighting note:', currentNoteIndex, 'total elements:', noteElementsRef.current.length);
            highlightCurrentNote();
        }
    }, [currentNoteIndex]);

    // Update visual feedback (box + progress bar)
    useEffect(() => {
        if (isPlaying && noteElementsRef.current.length > 0) {
            updateVisualFeedback();
        }
    }, [currentNoteIndex, playbackState.currentTime, playbackState.noteStartTime, isPlaying]);

    // Handle auto-scroll
    useEffect(() => {
        if (isPlaying && autoScroll && currentNoteIndex >= 0) {
            console.log('📜 Auto-scrolling to note:', currentNoteIndex);
            scrollToCurrentNote();
        }
    }, [currentNoteIndex, isPlaying, autoScroll]);

    const loadAndRenderMidi = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🎼 Loading MIDI for song:', songId, 'difficulty:', difficulty);

            const blob = await api.getSongMidi(songId, difficulty);
            const arrayBuffer = await blob.arrayBuffer();
            const midi = new Midi(arrayBuffer);

            console.log('✅ MIDI loaded:', {
                tracks: midi.tracks.length,
                duration: midi.duration,
                notes: midi.tracks[0]?.notes.length
            });

            const vexFlowData = convertMidiToVexFlow(midi);

            console.log('🎵 Converted to VexFlow:', {
                noteCount: vexFlowData.notes.length,
                tempo: vexFlowData.tempo,
                timeSignature: vexFlowData.timeSignature,
                totalDuration: vexFlowData.totalDuration
            });

            setMidiData(vexFlowData);

            // Notify parent that MIDI is loaded
            if (onMidiLoaded) {
                console.log('📤 Calling onMidiLoaded with', vexFlowData.notes.length, 'notes');
                onMidiLoaded(vexFlowData.notes);
            }

        } catch (err) {
            console.error('❌ Error loading MIDI:', err);
            setError('Failed to load sheet music: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const convertMidiToVexFlow = (midi) => {
        try {
            const track = midi.tracks[0];

            if (!track || track.notes.length === 0) {
                throw new Error('No notes found in MIDI file');
            }

            // FIX: Find the first note's start time and use it as offset
            const firstNoteTime = track.notes[0].time;
            const timeOffset = firstNoteTime > 2 ? firstNoteTime - 2 : 0; // Keep 2 second intro

            console.log('⏰ MIDI timing normalization:', {
                originalFirstNote: firstNoteTime.toFixed(2),
                offset: timeOffset.toFixed(2),
                newFirstNote: (firstNoteTime - timeOffset).toFixed(2)
            });

            const notes = track.notes.map(note => {
                const vfKey = midiNoteToVexFlow(note.midi, note.name);
                const vfDuration = durationToVexFlow(note.duration);

                // FIX: Apply time offset to normalize timing
                const normalizedTime = note.time - timeOffset;

                return {
                    keys: [vfKey],
                    duration: vfDuration,
                    time: normalizedTime,
                    endTime: normalizedTime + note.duration,
                    velocity: note.velocity,
                    // Original MIDI data
                    name: note.name,
                    midi: note.midi,
                    originalDuration: note.duration  // FIXED: renamed to avoid conflict
                };
            });

            // FIX: Ensure timeSignature has valid defaults
            const timeSignature = midi.header.timeSignatures?.[0] || {
                timeSignature: [4, 4],
                numerator: 4,
                denominator: 4
            };

            // Normalize time signature format
            const normalizedTimeSig = {
                numerator: timeSignature.numerator || timeSignature.timeSignature?.[0] || 4,
                denominator: timeSignature.denominator || timeSignature.timeSignature?.[1] || 4
            };

            console.log('⏱️ Time signature:', normalizedTimeSig);

            return {
                notes: notes,
                tempo: midi.header.tempos?.[0]?.bpm || 120,
                timeSignature: normalizedTimeSig,
                keySignature: 'C',
                totalDuration: midi.duration
            };
        } catch (err) {
            console.error('❌ Error converting MIDI:', err);
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

    const colorNotesBasedOnResults = () => {
        noteResults.forEach(result => {
            const { index, result: status } = result;

            if (index < 0 || index >= noteElementsRef.current.length) return;

            const color = {
                'correct': '#10b981',
                'close': '#f59e0b',
                'wrong': '#ef4444',
                'silent': '#9ca3af'
            }[status] || '#000000';

            const noteElement = noteElementsRef.current[index];
            const stemElement = noteStemsRef.current[index];

            if (noteElement) {
                noteElement.style.fill = color;
                noteElement.style.stroke = color;
            }

            if (stemElement) {
                stemElement.style.fill = color;
                stemElement.style.stroke = color;
            }
        });
    };

    const highlightCurrentNote = () => {
        // Safety check
        if (noteElementsRef.current.length === 0) {
            console.warn('⚠️ Cannot highlight: no note elements collected');
            return;
        }

        noteElementsRef.current.forEach((el, idx) => {
            if (!el) return;

            const result = noteResults.find(r => r.index === idx);

            if (result) {
                // Keep result color
                return;
            } else if (idx === currentNoteIndex) {
                // Current note - BRIGHT ORANGE
                el.style.fill = '#FF5500';
                el.style.stroke = '#FF5500';
                el.style.strokeWidth = '2';
                el.style.opacity = '1';

                if (noteStemsRef.current[idx]) {
                    noteStemsRef.current[idx].style.fill = '#FF5500';
                    noteStemsRef.current[idx].style.stroke = '#FF5500';
                    noteStemsRef.current[idx].style.strokeWidth = '2';
                }
            } else if (idx < currentNoteIndex) {
                // Past notes - dim
                el.style.opacity = '0.3';
                if (noteStemsRef.current[idx]) {
                    noteStemsRef.current[idx].style.opacity = '0.3';
                }
            } else {
                // Future notes - default
                el.style.fill = '#000000';
                el.style.stroke = '#000000';
                el.style.strokeWidth = '1';
                el.style.opacity = '1';

                if (noteStemsRef.current[idx]) {
                    noteStemsRef.current[idx].style.fill = '#000000';
                    noteStemsRef.current[idx].style.stroke = '#000000';
                    noteStemsRef.current[idx].style.strokeWidth = '1';
                    noteStemsRef.current[idx].style.opacity = '1';
                }
            }
        });
    };

    const scrollToCurrentNote = () => {
        if (!scrollContainerRef.current || currentNoteIndex < 0) return;

        const systemHeight = 150;
        const notesPerSystem = 8;
        const currentSystem = Math.floor(currentNoteIndex / notesPerSystem);

        const targetScroll = Math.max(0, currentSystem * systemHeight - 100);

        scrollContainerRef.current.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    };

    const renderScore = () => {
        if (!midiData || !containerRef.current) return;

        containerRef.current.innerHTML = '';
        noteElementsRef.current = [];
        noteStemsRef.current = [];

        const containerWidth = scrollContainerRef.current?.clientWidth || 800;
        const width = Math.floor(containerWidth - 40);
        const notesCount = midiData.notes.length;
        const notesPerSystem = 8;
        const systemsNeeded = Math.ceil(notesCount / notesPerSystem);
        const height = Math.max(600, systemsNeeded * 150 + 100);

        try {
            const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            const systemWidth = width - 40;

            for (let i = 0; i < systemsNeeded; i++) {
                const yPosition = 40 + (i * 150);
                const startIdx = i * notesPerSystem;
                const endIdx = Math.min(startIdx + notesPerSystem, notesCount);
                const systemNotes = midiData.notes.slice(startIdx, endIdx);

                if (systemNotes.length > 0) {
                    renderSystem(
                        context,
                        systemNotes,
                        20,
                        yPosition,
                        systemWidth,
                        i === 0,
                        midiData.timeSignature,
                        startIdx
                    );
                }
            }

            // Collect SVG elements after render
            setTimeout(() => {
                collectNoteElements();
            }, 100);

        } catch (err) {
            console.error('❌ Error rendering score:', err);
            setError('Error rendering sheet music: ' + err.message);
        }
    };

    const renderSystem = (context, notes, x, y, width, showClef, timeSignature, startIndex) => {
        if (!notes || notes.length === 0) return;

        try {
            const stave = new Stave(x, y, width);

            if (showClef) {
                stave.addClef('treble');
                // FIX: Validate time signature before using
                const timeSig = `${timeSignature.numerator || 4}/${timeSignature.denominator || 4}`;
                console.log('🎼 Adding time signature:', timeSig);
                stave.addTimeSignature(timeSig);
            } else {
                stave.addClef('treble');
            }

            stave.setContext(context).draw();

            const vfNotes = notes.map((noteData) => {
                try {
                    const note = new StaveNote({
                        keys: noteData.keys,
                        duration: noteData.duration,
                        clef: 'treble'
                    });

                    noteData.keys.forEach((key, keyIdx) => {
                        if (key.includes('#')) {
                            note.addModifier(new Accidental('#'), keyIdx);
                        } else if (key.includes('b')) {
                            note.addModifier(new Accidental('b'), keyIdx);
                        }
                    });

                    return note;
                } catch (err) {
                    console.warn('⚠️ Error creating note, using rest:', err);
                    return new StaveNote({
                        keys: ['b/4'],
                        duration: 'qr',
                        clef: 'treble'
                    });
                }
            });

            const voice = new Voice({
                num_beats: timeSignature.numerator || 4,
                beat_value: timeSignature.denominator || 4
            });
            voice.setMode(Voice.Mode.SOFT);
            voice.addTickables(vfNotes);

            new Formatter().joinVoices([voice]).format([voice], width - 100);
            voice.draw(context, stave);

        } catch (err) {
            console.error('❌ Error rendering system:', err);
        }
    };

    const collectNoteElements = () => {
        // Try multiple selectors for note heads (VexFlow versions vary)
        let noteHeads = containerRef.current.querySelectorAll('.vf-notehead path');

        if (noteHeads.length === 0) {
            // Try alternative selector
            noteHeads = containerRef.current.querySelectorAll('.vf-note path');
        }

        if (noteHeads.length === 0) {
            // Try even broader selector
            noteHeads = containerRef.current.querySelectorAll('g.vf-stavenote > g > path');
        }

        if (noteHeads.length === 0) {
            // Last resort - all note-related paths
            const allPaths = containerRef.current.querySelectorAll('path');
            noteHeads = Array.from(allPaths).filter(path => {
                const parent = path.parentElement;
                return parent && (
                    parent.classList.contains('vf-notehead') ||
                    parent.classList.contains('vf-note') ||
                    parent.parentElement?.classList.contains('vf-stavenote')
                );
            });
        }

        noteElementsRef.current = Array.from(noteHeads);

        // Collect all stem elements
        const stems = containerRef.current.querySelectorAll('.vf-stem path, path[class*="stem"]');
        noteStemsRef.current = Array.from(stems);

        console.log('✅ Collected elements:', {
            noteHeads: noteElementsRef.current.length,
            stems: noteStemsRef.current.length,
            attempts: noteHeads.length > 0 ? 'success' : 'fallback used'
        });

        // If still no note heads, log DOM structure for debugging
        if (noteElementsRef.current.length === 0) {
            console.warn('⚠️ No note heads found! Logging SVG structure:');
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
                const noteGroups = svgElement.querySelectorAll('g[class*="note"]');
                console.log('Found note groups:', noteGroups.length);
                if (noteGroups.length > 0) {
                    console.log('First note group:', noteGroups[0]);
                }
            }
        }

        // Apply initial coloring
        colorNotesBasedOnResults();
        highlightCurrentNote();
    };

    /**
     * Draw highlight box around current note
     */
    const drawHighlightBox = (noteIndex) => {
        // Remove existing box
        if (highlightBoxRef.current) {
            highlightBoxRef.current.remove();
            highlightBoxRef.current = null;
        }

        if (noteIndex < 0 || noteIndex >= noteElementsRef.current.length) return;

        const noteElement = noteElementsRef.current[noteIndex];
        if (!noteElement) return;

        try {
            const svg = containerRef.current.querySelector('svg');
            if (!svg) return;

            // Get bounding box of note
            const bbox = noteElement.getBBox();
            const padding = 8;

            // Create highlight rect
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', bbox.x - padding);
            rect.setAttribute('y', bbox.y - padding);
            rect.setAttribute('width', bbox.width + padding * 2);
            rect.setAttribute('height', bbox.height + padding * 2);
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', '#FF5500');
            rect.setAttribute('stroke-width', '3');
            rect.setAttribute('rx', '4');
            rect.setAttribute('class', 'current-note-highlight');

            // Insert before notes so it's behind
            const noteParent = noteElement.closest('g');
            if (noteParent && noteParent.parentElement) {
                noteParent.parentElement.insertBefore(rect, noteParent);
                highlightBoxRef.current = rect;
            }
        } catch (err) {
            console.warn('Could not draw highlight box:', err);
        }
    };

    /**
     * Draw or update progress bar under current note
     */
    const drawProgressBar = (noteIndex, progress) => {
        // Remove existing bar
        if (progressBarRef.current) {
            progressBarRef.current.remove();
            progressBarRef.current = null;
        }

        if (noteIndex < 0 || noteIndex >= noteElementsRef.current.length) return;
        if (progress < 0 || progress > 1) return;

        const noteElement = noteElementsRef.current[noteIndex];
        if (!noteElement) return;

        try {
            const svg = containerRef.current.querySelector('svg');
            if (!svg) return;

            // Get bounding box of note
            const bbox = noteElement.getBBox();
            const barWidth = 40;
            const barHeight = 4;
            const barY = bbox.y + bbox.height + 10;
            const barX = bbox.x + (bbox.width / 2) - (barWidth / 2);

            // Create group for progress bar
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'progress-bar');

            // Background bar (gray)
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', barX);
            bgRect.setAttribute('y', barY);
            bgRect.setAttribute('width', barWidth);
            bgRect.setAttribute('height', barHeight);
            bgRect.setAttribute('fill', '#e5e7eb');
            bgRect.setAttribute('rx', '2');

            // Progress bar (orange → green)
            const progressRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            progressRect.setAttribute('x', barX);
            progressRect.setAttribute('y', barY);
            progressRect.setAttribute('width', barWidth * progress);
            progressRect.setAttribute('height', barHeight);
            progressRect.setAttribute('fill', progress >= 0.8 ? '#10b981' : '#FF5500');
            progressRect.setAttribute('rx', '2');

            group.appendChild(bgRect);
            group.appendChild(progressRect);

            // Insert into SVG
            svg.appendChild(group);
            progressBarRef.current = group;
        } catch (err) {
            console.warn('Could not draw progress bar:', err);
        }
    };

    /**
     * Update visual feedback based on current note and progress
     */
    const updateVisualFeedback = () => {
        if (currentNoteIndex < 0) {
            // Remove visuals when no current note
            if (highlightBoxRef.current) {
                highlightBoxRef.current.remove();
                highlightBoxRef.current = null;
            }
            if (progressBarRef.current) {
                progressBarRef.current.remove();
                progressBarRef.current = null;
            }
            return;
        }

        // Draw highlight box
        drawHighlightBox(currentNoteIndex);

        // Calculate progress
        const expectedNote = playbackState.expectedNote;
        const noteStartTime = playbackState.noteStartTime;
        const currentTime = playbackState.currentTime;

        if (expectedNote && noteStartTime !== null) {
            const elapsed = currentTime - noteStartTime;
            const progress = Math.min(elapsed / expectedNote.duration, 1);
            drawProgressBar(currentNoteIndex, progress);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 75));
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
        <div className="synced-vexflow-renderer w-full">
            {/* Controls */}
            <div className="flex items-center justify-between mb-3 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} className="px-2 py-1 bg-white rounded text-sm hover:bg-gray-200">−</button>
                    <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
                    <button onClick={handleZoomIn} className="px-2 py-1 bg-white rounded text-sm hover:bg-gray-200">+</button>
                    <button onClick={handleZoomReset} className="px-2 py-1 bg-white rounded text-xs hover:bg-gray-200">Reset</button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">
                        {midiData?.notes.length} notes • {midiData?.tempo} BPM
                    </span>
                    <label className="flex items-center gap-1 cursor-pointer">
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

            {/* Color Legend */}
            <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5500' }}></div>
                    <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                    <span>Correct</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span>Close</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Wrong</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }}></div>
                    <span>Silent</span>
                </div>
            </div>

            {/* Sheet Music */}
            <div
                ref={scrollContainerRef}
                className="sheet-music-container border-2 border-gray-200 rounded-lg bg-white overflow-y-auto overflow-x-hidden shadow-inner"
                style={{ height: '500px' }}
            >
                <div ref={containerRef} className="p-4 w-full" />
            </div>

            {/* Status */}
            <div className="mt-2 text-xs text-center text-gray-500">
                {isPlaying && currentNoteIndex >= 0 && (
                    <span className="text-orange-600 font-medium">
                        ♪ Note {currentNoteIndex + 1} of {midiData?.notes.length}
                    </span>
                )}
                {isPlaying && currentNoteIndex === -1 && midiData?.notes.length > 0 && (
                    <span className="text-blue-600 font-medium animate-pulse">
                        ⏳ Waiting for first note at {Math.floor(midiData.notes[0].time)}:{String(Math.floor((midiData.notes[0].time % 1) * 60)).padStart(2, '0')}...
                    </span>
                )}
                {!isPlaying && <span>Press Play to start</span>}
            </div>
        </div>
    );
};

export default SyncedVexFlowRenderer;