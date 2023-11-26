import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SettingsProvider, NotesProvider, AudioReactProvider } from './context'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioReactProvider>
      <SettingsProvider>
        <NotesProvider>
          <App />
        </NotesProvider>
      </SettingsProvider>
    </AudioReactProvider>
  </React.StrictMode>,
)

// Example usage
//document.addEventListener('keydown', function (event) {
  //const note = getFrequency(event.key.toUpperCase() + '4');
  //if (note !== 0) {
    //playPianoNote(note);
  //}
//});
//}, 2000);
