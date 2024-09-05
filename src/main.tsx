import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {
  SettingsProvider,
  NotesProvider,
  AudioReactProvider,
  A11yProvider
} from './context'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioReactProvider>
      <SettingsProvider>
        <NotesProvider>
          <A11yProvider>
            <App />
          </A11yProvider>
        </NotesProvider>
      </SettingsProvider>
    </AudioReactProvider>
  </React.StrictMode>,
)
