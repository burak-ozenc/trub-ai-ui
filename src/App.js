import logo from './logo.svg';
import './App.css';
import MediaInput from "./Pages/MediaInput";
import AudioRecorder from "./Pages/MediaInputWithChat";

function App() {
  return (
      <div className="App">
        <h1>AI Trumpet Teacher</h1>
        <MediaInput/>
          <AudioRecorder/>
      </div>
  );
}

export default App;
