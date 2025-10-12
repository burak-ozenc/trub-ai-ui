# 🎺 Trub AI Frontend

Modern web interface for AI-powered trumpet performance analysis with real-time tuner and intelligent feedback.

## Features

### Practice Tools
- **Real-Time Tuner**: Center-stage pitch detection with visual feedback, shows note name, octave, frequency, and cents deviation
- **Metronome**: BPM control (40-240) with visual beat indicator, collapsible widget
- **Recording**: One-click recording with required guidance prompts
- **Audio Playback**: Review past performances with play/pause controls

### AI Teacher
- **LLM Chat**: Ask questions and get personalized feedback in left sidebar
- **Analysis**: 5-dimension performance evaluation (breath control, tone quality, rhythm/timing, musical expression, note flexibility)
- **Recommendations**: AI-generated practice tips based on analysis
- **Progress Tracking**: Line charts showing improvement trends over time

### User Management
- JWT authentication with secure token storage
- User profiles with skill levels (Beginner/Intermediate/Advanced)
- Recording history with metadata and audio files
- Settings management (LLM model selection, audio quality preferences)

## Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Backend API running on http://localhost:8000

## Quick Start

### 1. Install Node.js (if not installed)

**Windows:**
- Download from nodejs.org
- Run installer (includes npm)

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

This installs all required packages including:
- React 18+
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Recharts for progress visualization
- Lucide React for icons

### 4. Configure Environment

Create .env file:
```bash
cp .env.example .env
```

Edit .env file:

Windows: 
```bash
notepad .env
```
Linux/macOS: 
```bash
nano .env
```

Set backend API URL:
```bash
REACT_APP_API_URL=http://localhost:8000
```

### 5. Run Application
```bash
npm start
```

Application will be available at: http://localhost:3000

## UI Features

### Layout Structure

**Left Sidebar (576px):**
- AI Teacher chat interface
- Message history
- Question input
- Collapsible toggle

**Center Area:**
- Hero tuner widget (always visible)
- Recording guidance prompt with quick chips
- Record button (132px, orange gradient)
- Analysis results (collapsible)
- Technical metrics display

**Right Sidebar:**
- Recording History (top section)
- Metronome (bottom section)

### Color Theme (Energy - Orange/Teal)

Primary: #FF5500 (Vibrant Orange)
Secondary: #14b8a6 (Teal)
Success: #10b981 (Emerald Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Background: Soft peachy gradient

### Audio Features

**Tuner:**
- Pitch detection using autocorrelation algorithm
- Accuracy: ±1 cent
- Smoothing: Exponential moving average
- Default display: A4 (440Hz) when inactive
- Shows note name, octave, frequency, cents deviation
- Color zones: Green (in tune), Yellow (slightly off), Red (way off)

**Metronome:**
- Web Audio API for precise timing
- BPM range: 40-240
- Visual beat indicators
- Continues running when collapsed

**Recording:**
- Format: WAV (uncompressed)
- Sample rate: 44.1kHz
- Channels: Mono
- Max file size: 50MB
- Required guidance text before recording

## Project Structure
<pre>
src/
├── components/
│   ├── TrumpetAnalyzer.jsx              # Main container
│   ├── Header.jsx                       # App header
│   ├── Analyzer/
│   │   ├── TunerWidget.jsx              # Real-time tuner
│   │   ├── RecordButton.jsx             # Animated button
│   │   ├── GuidancePrompt.jsx           # Practice goal input
│   │   ├── MetronomeSidebar.jsx         # Metronome widget
│   │   ├── ChatSidebar.jsx              # AI chat interface
│   │   ├── RecordingHistory.jsx         # Past recordings
│   │   ├── AnalysisResults.jsx          # Results container
│   │   ├── TechnicalAnalysis.jsx        # Metrics display
│   │   ├── BreathAnalysisCard.jsx       # Breath metrics
│   │   ├── ToneAnalysisCard.jsx         # Tone metrics
│   │   ├── RhythmAnalysisCard.jsx       # Rhythm metrics
│   │   ├── ExpressionAnalysisCard.jsx   # Expression metrics
│   │   ├── FlexibilityAnalysisCard.jsx  # Flexibility metrics
│   │   ├── FeedbackDisplay.jsx          # LLM feedback
│   │   └── Recommendations.jsx          # Practice tips
│   ├── Auth/
│   │   ├── Login.jsx                    # Login page
│   │   ├── Register.jsx                 # Registration
│   │   └── ProtectedRoute.jsx           # Route guard
│   ├── Profile/
│   │   └── ProfileSettings.jsx          # User settings
│   └── Progress/
│       ├── ProgressDashboard.jsx        # Progress view
│       ├── ProgressCharts.jsx           # Trend charts
│       └── ProgressStats.jsx            # Statistics
├── hooks/
│   ├── useAudioRecorder.js              # Recording logic
│   ├── useChat.js                       # Chat functionality
│   ├── useTuner.js                      # Pitch detection
│   └── useMetronome.js                  # Metronome logic
├── store/
│   ├── index.js                         # Redux store
│   ├── hooks.js                         # Typed hooks
│   └── slices/
│       ├── recordingsSlice.js           # Recording state
│       └── settingsSlice.js             # Settings state
├── services/
│   └── api.js                           # API client
├── context/
│   └── AuthContext.jsx                  # Auth context
├── utils/
│   └── auth.js                          # Token management
├── App.jsx                              # Main app
└── index.jsx                            # Entry point
</pre>

## State Management (Redux)

### Recordings Slice

State:
- recordings: Array of recording objects
- currentRecording: Selected recording
- isPlaying: Audio playback state
- loading: Loading state
- error: Error message

Persisted to localStorage automatically.

### Settings Slice

State:
- llmModel: Selected LLM model
- audioQuality: Audio quality setting
- defaultAnalysisType: Default analysis mode
- showDetailedMetrics: Toggle detailed view

Persisted to localStorage automatically.

## User Flow

1. **Login/Register**: Create account, select skill level
2. **Start Tuner**: Check pitch in real-time
3. **Set Practice Goal**: Enter guidance text (required)
4. **Record Performance**: Capture audio with record button
5. **Get Analysis**: Receive AI feedback and technical metrics
6. **Review**: Check results, ask questions, replay recordings
7. **Track Progress**: View improvement charts and statistics

## Configuration

### API Endpoint

In .env file:
```
REACT_APP_API_URL=http://localhost:8000
```

## License

MIT License - see LICENSE file

## Contact

Burak Özenc - github.com/burak-ozenc

Project: github.com/burak-ozenc/trub-ai-ui
