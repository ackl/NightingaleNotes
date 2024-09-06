export function TutModal() {

  return (
    <section className='modal'>
      <h1>Tutorial</h1>
      <p>press space to play</p>
      <p>press j/k or up/down to change key</p>
      <p>press h/l or left/right to select tonality</p>
      <p>press 1-7 to (de)select triad</p>
      <p>press m to go to relative minor/major</p>
      <button onClick={() => {
        document.querySelector('.modal')?.classList.add('hidden');
      }}>close</button>
    </section>
  )
}

