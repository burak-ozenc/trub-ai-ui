/**
 * Note Validator Utility
 *
 * Validates detected pitch against expected notes from MIDI
 * Supports both 'wait' and 'flow' play modes
 */

/**
 * Note validation thresholds by skill level
 */
const VALIDATION_THRESHOLDS = {
    beginner: {
        pitchTolerance: 50,      // ±50 cents (half semitone)
        closeThreshold: 30,      // ±30 cents = "close"
        durationTolerance: 0.3,  // ±30% duration
    },
    intermediate: {
        pitchTolerance: 30,      // ±30 cents
        closeThreshold: 20,      // ±20 cents = "close"
        durationTolerance: 0.2,  // ±20% duration
    },
    advanced: {
        pitchTolerance: 20,      // ±20 cents
        closeThreshold: 10,      // ±10 cents = "close"
        durationTolerance: 0.15, // ±15% duration
    }
};

/**
 * Convert note name + octave to MIDI number
 * @param {string} note - Note name (e.g., "C", "C#", "Db")
 * @param {number} octave - Octave number
 * @returns {number} MIDI note number
 */
function noteToMidi(note, octave) {
    const noteMap = {
        'C': 0, 'C#': 1, 'Db': 1,
        'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4,
        'F': 5, 'F#': 6, 'Gb': 6,
        'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10,
        'B': 11
    };

    const noteValue = noteMap[note];
    if (noteValue === undefined) return null;

    return (octave + 1) * 12 + noteValue;
}

/**
 * Parse pitch string like "C4" into note and octave
 * @param {string} pitch - Pitch string (e.g., "C4", "C#5")
 * @returns {Object} { note, octave }
 */
function parsePitch(pitch) {
    if (!pitch || typeof pitch !== 'string') {
        return { note: null, octave: null };
    }

    const match = pitch.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) {
        return { note: null, octave: null };
    }

    return {
        note: match[1],
        octave: parseInt(match[2])
    };
}

/**
 * Calculate cents difference between two frequencies
 * @param {number} freq1 - First frequency
 * @param {number} freq2 - Second frequency
 * @returns {number} Cents difference
 */
function calculateCentsDifference(freq1, freq2) {
    if (!freq1 || !freq2 || freq1 <= 0 || freq2 <= 0) return 0;
    return Math.round(1200 * Math.log2(freq2 / freq1));
}

/**
 * Main validation function
 *
 * @param {Object} expected - Expected note from MIDI
 * @param {string} expected.pitch - Note pitch (e.g., "C4")
 * @param {number} expected.frequency - Expected frequency in Hz
 * @param {number} expected.startTime - Note start time in seconds
 * @param {number} expected.endTime - Note end time in seconds
 * @param {number} expected.duration - Note duration in seconds
 * @param {number} expected.index - Note index in sequence
 *
 * @param {Object} detected - Detected pitch from tuner
 * @param {string} detected.note - Detected note name (e.g., "C")
 * @param {number} detected.octave - Detected octave
 * @param {number} detected.frequency - Detected frequency in Hz
 * @param {number} detected.cents - Cents offset from detected note
 * @param {boolean} detected.isDetecting - Is sound being detected
 * @param {number} detected.audioLevel - Audio level (0-1)
 *
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} noteStartTime - When user started playing this note
 * @param {string} skillLevel - User skill level ('beginner', 'intermediate', 'advanced')
 *
 * @returns {Object} Validation result
 */
export function validateNote(expected, detected, currentTime, noteStartTime, skillLevel = 'intermediate') {
    const thresholds = VALIDATION_THRESHOLDS[skillLevel] || VALIDATION_THRESHOLDS.intermediate;

    // Initialize result
    const result = {
        result: 'silent',        // 'correct', 'close', 'wrong', 'silent'
        accuracy: 0,             // 0-100
        pitchMatch: false,
        pitchAccuracy: 0,
        centsOff: 0,
        durationMatch: false,
        durationAccuracy: 0,
        durationHeld: 0,
        expectedDuration: expected.duration,
        timestamp: currentTime,
        feedback: ''
    };

    // Check if sound is being detected
    if (!detected.isDetecting || detected.audioLevel < 0.05) {
        result.result = 'silent';
        result.feedback = 'No sound detected';
        return result;
    }

    // Parse expected pitch
    const expectedParsed = parsePitch(expected.pitch);
    if (!expectedParsed.note || expectedParsed.octave === null) {
        result.result = 'wrong';
        result.feedback = 'Invalid expected note';
        return result;
    }

    // Calculate MIDI numbers for comparison
    const expectedMidi = noteToMidi(expectedParsed.note, expectedParsed.octave);
    const detectedMidi = noteToMidi(detected.note, detected.octave);

    if (expectedMidi === null || detectedMidi === null) {
        result.result = 'wrong';
        result.feedback = 'Invalid note detected';
        return result;
    }

    // 1. PITCH VALIDATION
    const semitoneDifference = Math.abs(expectedMidi - detectedMidi);

    // Calculate cents difference from expected frequency
    const totalCentsOff = calculateCentsDifference(expected.frequency, detected.frequency);
    result.centsOff = totalCentsOff;

    // Check if pitch matches (same note, within tolerance)
    if (semitoneDifference === 0) {
        // Same note - check cents
        const absCents = Math.abs(totalCentsOff);

        if (absCents <= thresholds.closeThreshold) {
            result.pitchMatch = true;
            result.pitchAccuracy = Math.round(100 - (absCents / thresholds.closeThreshold) * 10);
        } else if (absCents <= thresholds.pitchTolerance) {
            result.pitchMatch = false; // Close but not perfect
            result.pitchAccuracy = Math.round(70 - ((absCents - thresholds.closeThreshold) /
                (thresholds.pitchTolerance - thresholds.closeThreshold)) * 40);
        } else {
            result.pitchMatch = false;
            result.pitchAccuracy = Math.round(30 - Math.min(absCents / 100, 1) * 30);
        }
    } else if (semitoneDifference === 1) {
        // Off by one semitone - partial credit
        result.pitchMatch = false;
        result.pitchAccuracy = 20;
    } else {
        // Way off
        result.pitchMatch = false;
        result.pitchAccuracy = 0;
    }

    // 2. DURATION VALIDATION
    const durationHeld = currentTime - noteStartTime;
    result.durationHeld = durationHeld;

    const durationRatio = durationHeld / expected.duration;
    const durationDeviation = Math.abs(durationRatio - 1.0);

    if (durationDeviation <= thresholds.durationTolerance) {
        result.durationMatch = true;
        result.durationAccuracy = Math.round(100 - (durationDeviation / thresholds.durationTolerance) * 20);
    } else if (durationDeviation <= thresholds.durationTolerance * 2) {
        result.durationMatch = false;
        result.durationAccuracy = Math.round(60 - (durationDeviation / thresholds.durationTolerance) * 20);
    } else {
        result.durationMatch = false;
        result.durationAccuracy = 30;
    }

    // 3. OVERALL RESULT
    const absCents = Math.abs(totalCentsOff);

    if (result.pitchMatch && result.durationMatch) {
        result.result = 'correct';
        result.accuracy = Math.round((result.pitchAccuracy + result.durationAccuracy) / 2);
        result.feedback = `Perfect! ${expected.pitch} in tune`;
    } else if (semitoneDifference === 0 && absCents <= thresholds.pitchTolerance) {
        result.result = 'close';
        result.accuracy = Math.round((result.pitchAccuracy + result.durationAccuracy) / 2);

        if (!result.durationMatch && result.pitchMatch) {
            result.feedback = `${expected.pitch} - Hold longer`;
        } else if (result.durationMatch && !result.pitchMatch) {
            result.feedback = `${expected.pitch} - Adjust pitch ${totalCentsOff > 0 ? '↓' : '↑'}`;
        } else {
            result.feedback = `${expected.pitch} - Close!`;
        }
    } else {
        result.result = 'wrong';
        result.accuracy = Math.round((result.pitchAccuracy + result.durationAccuracy) / 2);

        if (semitoneDifference === 0) {
            result.feedback = `${expected.pitch} - Way off pitch`;
        } else if (semitoneDifference === 1) {
            result.feedback = detectedMidi > expectedMidi
                ? `Too high - play ${expected.pitch}`
                : `Too low - play ${expected.pitch}`;
        } else {
            result.feedback = `Wrong note - play ${expected.pitch}`;
        }
    }

    return result;
}

/**
 * Helper to check if note duration requirement is met
 * @param {number} noteStartTime - When note was first detected
 * @param {number} currentTime - Current playback time
 * @param {number} expectedDuration - Expected duration
 * @param {string} skillLevel - User skill level
 * @returns {boolean} True if duration requirement met
 */
export function isDurationRequirementMet(noteStartTime, currentTime, expectedDuration, skillLevel = 'intermediate') {
    if (!noteStartTime) return false;

    const thresholds = VALIDATION_THRESHOLDS[skillLevel] || VALIDATION_THRESHOLDS.intermediate;
    const heldDuration = currentTime - noteStartTime;
    const requiredDuration = expectedDuration * (1 - thresholds.durationTolerance);

    return heldDuration >= requiredDuration;
}

/**
 * Calculate session statistics from note results
 * @param {Array} noteResults - Array of validation results
 * @returns {Object} Session statistics
 */
export function calculateSessionStats(noteResults) {
    if (!noteResults || noteResults.length === 0) {
        return {
            totalNotes: 0,
            correctNotes: 0,
            closeNotes: 0,
            wrongNotes: 0,
            silentNotes: 0,
            overallAccuracy: 0,
            pitchAccuracy: 0,
            durationAccuracy: 0
        };
    }

    const stats = {
        totalNotes: noteResults.length,
        correctNotes: 0,
        closeNotes: 0,
        wrongNotes: 0,
        silentNotes: 0,
        overallAccuracy: 0,
        pitchAccuracy: 0,
        durationAccuracy: 0
    };

    let totalAccuracy = 0;
    let totalPitchAccuracy = 0;
    let totalDurationAccuracy = 0;

    noteResults.forEach(result => {
        switch (result.result) {
            case 'correct':
                stats.correctNotes++;
                break;
            case 'close':
                stats.closeNotes++;
                break;
            case 'wrong':
                stats.wrongNotes++;
                break;
            case 'silent':
                stats.silentNotes++;
                break;
        }

        totalAccuracy += result.accuracy || 0;
        totalPitchAccuracy += result.pitchAccuracy || 0;
        totalDurationAccuracy += result.durationAccuracy || 0;
    });

    stats.overallAccuracy = Math.round(totalAccuracy / stats.totalNotes);
    stats.pitchAccuracy = Math.round(totalPitchAccuracy / stats.totalNotes);
    stats.durationAccuracy = Math.round(totalDurationAccuracy / stats.totalNotes);

    return stats;
}

export default {
    validateNote,
    isDurationRequirementMet,
    calculateSessionStats,
    VALIDATION_THRESHOLDS
};