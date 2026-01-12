/**
 * MIDI Helper Utility - DEBUG VERSION
 *
 * Helper functions for working with parsed MIDI data
 */

/**
 * Convert MIDI note number to frequency (Hz)
 * @param {number} midiNumber - MIDI note number (0-127)
 * @returns {number} Frequency in Hz
 */
export function midiToFrequency(midiNumber) {
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

/**
 * Convert MIDI note name to simple format
 * @param {string} noteName - MIDI note name (e.g., "C4", "C#5", "Db5")
 * @returns {string} Simplified note (e.g., "C4", "C#5")
 */
export function simplifyNoteName(noteName) {
    return noteName.replace('b', '#');
}

/**
 * Convert parsed MIDI note to expected note format for validation
 * @param {Object} midiNote - Note from @tonejs/midi
 * @returns {Object} Expected note format
 */
export function convertMidiNoteToExpected(midiNote, index) {
    const converted = {
        pitch: midiNote.name,
        frequency: midiToFrequency(midiNote.midi),
        startTime: midiNote.time,
        endTime: midiNote.time + midiNote.originalDuration,  // FIXED: use originalDuration
        duration: midiNote.originalDuration,  // FIXED: use originalDuration
        velocity: midiNote.velocity,
        index: index
    };

    // DEBUG: Log first 3 notes
    if (index < 3) {
        console.log(`🎵 Convert note ${index}:`, converted);
    }

    return converted;
}

/**
 * Find the note that should be playing at a given time - DEBUG VERSION
 * @param {number} currentTime - Current playback time in seconds
 * @param {Array} notes - Array of expected notes
 * @returns {Object|null} Expected note or null
 */
export function findNoteAtTime(currentTime, notes) {
    if (!notes || notes.length === 0) {
        console.warn('⚠️ findNoteAtTime: notes array is empty or null');
        return null;
    }

    // DEBUG: Log occasionally
    const shouldLog = Math.random() < 0.1; // 10% of calls

    if (shouldLog) {
        console.log('🔍 findNoteAtTime:', {
            currentTime: currentTime.toFixed(3),
            notesCount: notes.length,
            firstNote: notes[0] ? `${notes[0].pitch} (${notes[0].startTime}-${notes[0].endTime})` : 'none',
            lastNote: notes[notes.length-1] ? `${notes[notes.length-1].pitch} (${notes[notes.length-1].startTime}-${notes[notes.length-1].endTime})` : 'none'
        });
    }

    // Find note where currentTime is between startTime and endTime
    const note = notes.find(n => {
        // Check if properties exist
        if (typeof n.startTime !== 'number' || typeof n.endTime !== 'number') {
            console.error('❌ Invalid note:', n);
            return false;
        }

        return currentTime >= n.startTime && currentTime < n.endTime;
    });

    if (shouldLog && note) {
        console.log('✅ Found note:', note.pitch);
    }

    return note || null;
}

/**
 * Find the index of the note at a given time - DEBUG VERSION
 * @param {number} currentTime - Current playback time in seconds
 * @param {Array} notes - Array of expected notes
 * @returns {number} Note index or -1
 */
export function findNoteIndexAtTime(currentTime, notes) {
    if (!notes || notes.length === 0) {
        console.warn('⚠️ findNoteIndexAtTime: notes array is empty or null');
        return -1;
    }

    // DEBUG: Detailed logging
    const shouldLog = Math.floor(currentTime) % 2 === 0 && currentTime - Math.floor(currentTime) < 0.1;

    if (shouldLog) {
        console.log('🔍 findNoteIndexAtTime DEBUG:', {
            currentTime: currentTime.toFixed(3),
            notesCount: notes.length,
            sampleNote: notes[0] ? {
                pitch: notes[0].pitch,
                startTime: notes[0].startTime,
                endTime: notes[0].endTime,
                hasProperties: {
                    startTime: typeof notes[0].startTime,
                    endTime: typeof notes[0].endTime,
                    pitch: typeof notes[0].pitch
                }
            } : 'no notes'
        });
    }

    const index = notes.findIndex(n => {
        // Validate note structure
        if (!n || typeof n.startTime !== 'number' || typeof n.endTime !== 'number') {
            if (shouldLog) {
                console.error('❌ Invalid note structure:', n);
            }
            return false;
        }

        const matches = currentTime >= n.startTime && currentTime < n.endTime;

        // DEBUG: Log matching attempts for first few notes
        if (shouldLog && notes.indexOf(n) < 3) {
            console.log(`  Note ${notes.indexOf(n)} (${n.pitch}): ${n.startTime.toFixed(2)}-${n.endTime.toFixed(2)} | current=${currentTime.toFixed(2)} | match=${matches}`);
        }

        return matches;
    });

    if (shouldLog) {
        console.log(`  → Result: index=${index}`);
    }

    return index;
}

/**
 * Get the next note after current time
 * @param {number} currentTime - Current playback time in seconds
 * @param {Array} notes - Array of expected notes
 * @returns {Object|null} Next note or null
 */
export function getNextNote(currentTime, notes) {
    if (!notes || notes.length === 0) return null;

    const nextNote = notes.find(n => n.startTime > currentTime);
    return nextNote || null;
}

/**
 * Get notes in a time range
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @param {Array} notes - Array of expected notes
 * @returns {Array} Notes in range
 */
export function getNotesInRange(startTime, endTime, notes) {
    if (!notes || notes.length === 0) return [];

    return notes.filter(n =>
        (n.startTime >= startTime && n.startTime < endTime) ||
        (n.endTime > startTime && n.endTime <= endTime) ||
        (n.startTime < startTime && n.endTime > endTime)
    );
}

/**
 * Calculate which system (line) a note should be on
 * @param {number} noteIndex - Index of note
 * @param {number} notesPerSystem - Notes per system (default 8)
 * @returns {number} System index (0-based)
 */
export function getNoteSystem(noteIndex, notesPerSystem = 8) {
    return Math.floor(noteIndex / notesPerSystem);
}

/**
 * Check if we're in the window to start detecting a note
 * (a bit before the note actually starts)
 * @param {number} currentTime - Current playback time
 * @param {Object} note - Expected note
 * @param {number} anticipationWindow - Seconds before note starts (default 0.2)
 * @returns {boolean} True if in anticipation window
 */
export function isInAnticipationWindow(currentTime, note, anticipationWindow = 0.2) {
    if (!note) return false;
    return currentTime >= (note.startTime - anticipationWindow) && currentTime < note.startTime;
}

/**
 * Check if a note has ended
 * @param {number} currentTime - Current playback time
 * @param {Object} note - Expected note
 * @returns {boolean} True if note has ended
 */
export function hasNoteEnded(currentTime, note) {
    if (!note) return false;
    return currentTime >= note.endTime;
}

/**
 * Get progress through current note (0-1)
 * @param {number} currentTime - Current playback time
 * @param {Object} note - Expected note
 * @returns {number} Progress 0-1, or 0 if not in note
 */
export function getNoteProgress(currentTime, note) {
    if (!note) return 0;

    if (currentTime < note.startTime) return 0;
    if (currentTime >= note.endTime) return 1;

    return (currentTime - note.startTime) / note.duration;
}

/**
 * Group notes by system for rendering
 * @param {Array} notes - Array of notes
 * @param {number} notesPerSystem - Notes per system
 * @returns {Array} Array of systems, each containing notes
 */
export function groupNotesBySystem(notes, notesPerSystem = 8) {
    if (!notes || notes.length === 0) return [];

    const systems = [];
    for (let i = 0; i < notes.length; i += notesPerSystem) {
        systems.push(notes.slice(i, i + notesPerSystem));
    }

    return systems;
}

/**
 * Calculate statistics for a sequence of notes
 * @param {Array} notes - Array of notes
 * @returns {Object} Statistics
 */
export function calculateNoteSequenceStats(notes) {
    if (!notes || notes.length === 0) {
        return {
            totalNotes: 0,
            totalDuration: 0,
            averageDuration: 0,
            minPitch: null,
            maxPitch: null,
            pitchRange: 0
        };
    }

    const durations = notes.map(n => n.duration);
    const frequencies = notes.map(n => n.frequency);

    return {
        totalNotes: notes.length,
        totalDuration: notes[notes.length - 1].endTime - notes[0].startTime,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minPitch: Math.min(...frequencies),
        maxPitch: Math.max(...frequencies),
        pitchRange: Math.max(...frequencies) - Math.min(...frequencies)
    };
}

export default {
    midiToFrequency,
    simplifyNoteName,
    convertMidiNoteToExpected,
    findNoteAtTime,
    findNoteIndexAtTime,
    getNextNote,
    getNotesInRange,
    getNoteSystem,
    isInAnticipationWindow,
    hasNoteEnded,
    getNoteProgress,
    groupNotesBySystem,
    calculateNoteSequenceStats
};