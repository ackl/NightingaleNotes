export const TutModal = () => (
    <section className='modal'>
      <h1>Tutorial</h1>
      <p>click a key to play the highlighted notes</p>
      <p>press space to play highlighted notes</p>
      <p>press J/K or up/down to change key</p>
      <p>press H/L or left/right to select tonality</p>
      <p>press 1-7 to (de)select triad</p>
      <p>press m to go to relative minor/major</p>
      <b>press ESC to exit tutorial</b>
      <button onClick={() => {
        document.querySelector('.modal')?.classList.remove('non-touch');
      }}>close</button>
    </section>
  )

