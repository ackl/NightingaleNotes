import { useState } from 'react'
import { notes, getMajorScale, getNoteLabel } from './lib';
import './App.css'

function Note() {
  return (
    <div>x</div>
  )
}

function App() {
  const dMaj = getMajorScale(2);
  console.log(dMaj);

  return (
    <main>
      {
        notes.map(note => (
          <Note />
        ))
      }
    </main>
  )
}

export default App
