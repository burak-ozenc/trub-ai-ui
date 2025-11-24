import React, { useEffect, useRef, useState } from 'react';
import Vex from 'vexflow';

const VexFlowSheetMusic = ({ songId, difficulty, currentTime }) => {
    const containerRef = useRef(null);
    const [renderer, setRenderer] = useState(null);
    const [context, setContext] = useState(null);
    const [stave, setStave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (containerRef.current) {
            initializeVexFlow();
        }
    }, []);

    useEffect(() => {
        if (songId && difficulty) {
            loadAndRenderMidi();
        }
    }, [songId, difficulty]);

    const initializeVexFlow = () => {
        try {
            const VF = Vex.Flow;

            // Clear previous content
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }

            // Create renderer
            const div = containerRef.current;
            const width = div.clientWidth || 800;
            const height = 600;

            const newRenderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
            newRenderer.resize(width, height);
            const newContext = newRenderer.getContext();
            newContext.setFont('Arial', 10);

            setRenderer(newRenderer);
            setContext(newContext);

            // Render placeholder while loading MIDI
            renderPlaceholder(newContext);
        } catch (err) {
            console.error('Error initializing VexFlow:', err);
            setError('Failed to initialize sheet music renderer');
        }
    };

    const renderPlaceholder = (ctx) => {
        const VF = Vex.Flow;

        // Create a simple staff as placeholder
        const stave = new VF.Stave(10, 40, 760);
        stave.addClef('treble').addTimeSignature('4/4');
        stave.setContext(ctx).draw();

        // Add "Loading..." text
        ctx.fillText('Loading sheet music...', 350, 300);
    };

    const loadAndRenderMidi = async () => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Fetch MIDI from backend
            // For now, render a simple example

            const VF = Vex.Flow;

            // Clear previous rendering
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }

            const div = containerRef.current;
            const width = div.clientWidth || 800;
            const height = 600;

            const newRenderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
            newRenderer.resize(width, height);
            const ctx = newRenderer.getContext();
            ctx.setFont('Arial', 10);

            // Create stave
            const stave = new VF.Stave(10, 40, 760);
            stave.addClef('treble').addTimeSignature('4/4').addKeySignature('Bb');
            stave.setContext(ctx).draw();

            // Example notes (will be replaced with actual MIDI parsing)
            const notes = [
                new VF.StaveNote({ keys: ['c/4'], duration: 'q' }),
                new VF.StaveNote({ keys: ['d/4'], duration: 'q' }),
                new VF.StaveNote({ keys: ['e/4'], duration: 'q' }),
                new VF.StaveNote({ keys: ['f/4'], duration: 'q' }),
            ];

            // Create voice
            const voice = new VF.Voice({ num_beats: 4, beat_value: 4 });
            voice.addTickables(notes);

            // Format and draw
            new VF.Formatter()
                .joinVoices([voice])
                .format([voice], 700);

            voice.draw(ctx, stave);

            setLoading(false);
        } catch (err) {
            console.error('Error loading sheet music:', err);
            setError('Failed to load sheet music');
            setLoading(false);
        }
    };

    const parseAndRenderMidi = (midiData) => {
        // TODO: Implement MIDI parsing and rendering
        // This requires midi-parser-js or similar library
        // For MVP, we'll use pre-rendered PDFs instead

        console.log('MIDI parsing not yet implemented');
    };

    if (error) {
        return (
            <div className="text-center text-red-500 py-8">
                <div className="text-4xl mb-2">⚠️</div>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="sheet-music-container">
            <div ref={containerRef} className="vexflow-container" />
            {loading && (
                <div className="text-center text-gray-500 py-4">
                    <div className="animate-spin text-2xl mb-2">🎼</div>
                    <p>Loading sheet music...</p>
                </div>
            )}
        </div>
    );
};

export default VexFlowSheetMusic;