import { useContext } from 'react'
import { SettingsContext } from '../context'
import { Octave } from './octave'

export function Keyboard() {
  const { octaves } = useContext(SettingsContext);

  const els = [];
  for (let i = 0; i < octaves; i++) {
    els.push(
      <Octave
        key={i}
        isFirstOctave={i === 0}
        isLastOctave={i === (octaves - 1)}
      />
    )
  }

  return (
    <div className='keyboard-wrapper'>
      <section className='keyboard'>
        {els.map(el => el)}
      </section>
    </div>
  )
}

