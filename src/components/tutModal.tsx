import { useEffect } from 'react';

export function TutModal() {
  function closeHandler(ev: KeyboardEvent) {
    if (ev.code === 'Escape') {
      document.body.classList.toggle('non-touch');
    }
  }
  useEffect(() => {
    document.addEventListener('keyup', closeHandler);
    return () => document.removeEventListener('keyup', closeHandler);
  }, []);

  return (
    <section className="modal">
      <h1>Tutorial</h1>
      <p>click a key to play the highlighted notes</p>
      <p>press space to play highlighted notes (or click the play button)</p>
      <p>press j/k or up/down to change key signature (or click the dropdown)</p>
      <p>press h/l or left/right to select tonality</p>
      <p>press 1-7 to (de)select triad</p>
      <p>press s to show/hide note labels</p>
      <p>press a to show/hide all note labels</p>
      <p>press m to go to relative minor/major</p>
      <b>press esc to exit/enter tutorial</b>
      <button
        type="button"
        onClick={() => document.body.classList.toggle('non-touch')}>
        close
      </button>
    </section>
  );
}
