# 🎺 Trub AI Frontend

Modern web interface for AI-powered trumpet performance analysis with real-time tuner, intelligent feedback, and interactive play-along.

## Features

### Practice Tools
- **Real-Time Tuner**: Pitch detection with visual feedback (note, frequency, cents deviation)
- **Metronome**: BPM control (40-240) with visual beat indicator
- **Recording**: One-click recording with guidance prompts
- **Audio Playback**: Review past performances

### Play-Along Feature (NEW)
- **Interactive Sheet Music**: Real-time note highlighting with VexFlow
- **30 Public Domain Songs**: Classical, folk, and Christmas music
- **3 Difficulty Levels**: Beginner, intermediate, and advanced per song
- **Live Feedback**: Color-coded note validation (correct/close/wrong)
- **Practice Modes**: 
  - **Wait Mode**: Pauses until correct note is played
  - **Flow Mode**: Continuous play with real-time scoring
- **Performance Tracking**: Pitch accuracy, duration accuracy, overall score

### AI Teacher
- **LLM Chat**: Ask questions and get personalized feedback
- **5-Dimension Analysis**: Breath control, tone quality, rhythm/timing, expression, flexibility
- **AI Recommendations**: Practice tips based on analysis
- **Progress Tracking**: Charts showing improvement trends

### User Management
- JWT authentication with secure token storage
- User profiles with skill levels
- Recording and session history
- Settings management

## Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Backend API running on http://localhost:8000

## Quick Start

### 1. Install Node.js

**Windows:** Download from nodejs.org

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

### 2. Clone Repository
```bash
git clone https://github.com/burak-ozenc/trub-ai-ui.git
cd trub-ai-ui
```

### 3. Install Dependencies
```bash
npm install
```

Key packages:
- React 18+
- Redux Toolkit
- React Router
- Tailwind CSS
- VexFlow (sheet music rendering)
- @tonejs/midi (MIDI parsing)
- Recharts (progress visualization)

### 4. Configure Environment

Create `.env` file:
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 5. Run Application
```bash
npm start
```

Application available at: http://localhost:3000

## UI Features

### Layout Structure

**Left Sidebar:**
- AI Teacher chat interface
- Message history
- Question input

**Center Area:**
- Tuner widget (always visible)
- Recording controls
- Analysis results
- **Play-along interface (NEW)**

**Right Sidebar:**
- Recording History
- Metronome

### Color Theme

- Primary: #FF5500 (Orange)
- Secondary: #14b8a6 (Teal)
- Success: #10b981 (Green)
- Warning: #f59e0b (Yellow)
- Error: #ef4444 (Red)

### Play-Along Interface (NEW)

**Sheet Music Renderer:**
- VexFlow-based notation display
- Real-time note highlighting (orange for current note)
- Color-coded feedback:
  - Green: Correct pitch and duration
  - Yellow: Close (within tolerance)
  - Red: Wrong note or off-pitch
  - Gray: Silent/no sound detected

**Practice Controls:**
- Play/Pause audio playback
- Tempo adjustment (50%-150%)
- Mode toggle (Wait/Flow)
- Progress tracking
- Live statistics

**Validation:**
- Real-time pitch detection via tuner
- Note-by-note accuracy scoring
- Duration validation
- Skill-level adjusted thresholds

## Project Structure

```
src/
├── components/
│   ├── Common/
│   │   └── Header.jsx
│   ├── Analyzer/
│   │   ├── TunerWidget.jsx
│   │   ├── RecordButton.jsx
│   │   ├── MetronomeSidebar.jsx
│   │   └── ... (analysis cards)
│   ├── PlayAlong/                           # NEW
│   │   └── SyncedVexFlowRenderer.jsx        # Sheet music renderer
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── Progress/
│       └── ProgressDashboard.jsx
├── pages/
│   ├── HomePage.jsx                         # NEW: Landing page
│   ├── SongLibraryPage.jsx                  # NEW: Song browser
│   └── PlayAlongPage.jsx                    # NEW: Practice interface
├── hooks/
│   ├── useAudioRecorder.js
│   ├── useChat.js
│   ├── useTuner.js
│   └── useMetronome.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── recordingsSlice.js
│       ├── settingsSlice.js
│       └── playbackSlice.js                 # NEW: Playback state
├── utils/
│   ├── auth.js
│   ├── noteValidator.js                     # NEW: Note validation
│   └── midiHelper.js                        # NEW: MIDI utilities
├── services/
│   └── api.js                               # API client
└── App.jsx
```

## State Management (Redux)

### Recordings Slice
- Recording history
- Current recording
- Playback state

### Settings Slice
- LLM model
- Audio quality
- Analysis preferences

### Playback Slice (NEW)
- Current time and duration
- Note tracking (current index, expected note)
- Detected pitch from tuner
- Validation results
- Session statistics
- Practice mode (wait/flow)

## User Flow

### Traditional Practice:
1. Login → Start Tuner → Record → Get Analysis → Review

### Play-Along (NEW):
1. Login → Browse Song Library → Select Song & Difficulty
2. Practice with real-time feedback
3. Complete session → View score and statistics

## Configuration

### API Endpoint
In `.env` file:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

## License

MIT License - see LICENSE file

## Contact

Burak Özenc - [GitHub](https://github.com/burak-ozenc)

Project: [trub-ai-ui](https://github.com/burak-ozenc/trub-ai-ui)
