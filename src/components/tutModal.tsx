import { useEffect, useRef } from "react";

export const TutModal = () => {
    function closeHandler(ev: KeyboardEvent) {
      console.log("SHIT", ev.code);
      if (ev.code === 'Escape') {
        document.body.classList.toggle('non-touch');
      }
    }
  useEffect(() => {

    document.addEventListener('keyup', closeHandler)
    return () => document.removeEventListener('keyup', closeHandler)
  }, [])

  return (
    <section className='modal'>
      <h1>Tutorial</h1>
      <p>click a key to play the highlighted notes</p>
      <p>press space to play highlighted notes</p>
      <p>press J/K or up/down to change key</p>
      <p>press H/L or left/right to select tonality</p>
      <p>press 1-7 to (de)select triad</p>
      <p>press m to go to relative minor/major</p>
      <b>press ESC to exit/enter tutorial</b>
      <button onClick={() => document.body.classList.toggle('non-touch')}>close</button>
    </section>
  )
}
