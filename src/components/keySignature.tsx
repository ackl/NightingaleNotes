import { useContext, useRef } from 'react';
import { NotesContext } from '../context';
import { SHARP_ORDER, FLAT_ORDER } from '../lib/key-signatures/calculator';
import { KeySignatureAccidentalType } from '../lib/key-signatures/labeling';
import { NaturalNote } from '../lib/core/scales';

const commonAccidentalPositions: Record<NaturalNote, number> = {
  11: 40, // B
  4: 25, // E
  9: 45, // A
  2: 30, // D
  0: 35, // C
  5: 0, // F
  7: 0, // G
};

const TREBLE_CLEF_POSITIONS: Record<Exclude<KeySignatureAccidentalType, 'NATURAL'>,
  Record<NaturalNote, number>> = {
  SHARP: {
    ...commonAccidentalPositions,
    5: 20, // F
    7: 15, // G
  },
  FLAT: {
    ...commonAccidentalPositions,
    7: 50, // G
    5: 55, // F
  },
};

// Get staff position for a note number
function getStaffPosition(note: number, accidentalType: KeySignatureAccidentalType): number {
  return TREBLE_CLEF_POSITIONS[accidentalType][note] || 35;
}

export function KeySignature() {


  const { keySignature } = useContext(NotesContext);
  const svgRef = useRef<SVGSVGElement>(null);

  if (svgRef.current) {
    svgRef.current.innerHTML = '';

    // Draw staff lines
    const staffLines = [20, 30, 40, 50, 60];
    const staffWidth = 70 + keySignature.accidentals.length * 8;

    staffLines.forEach((y) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '10');
      line.setAttribute('x2', staffWidth.toString());
      line.setAttribute('y1', y.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#fff');
      line.setAttribute('stroke-width', '1');
      svgRef.current!.appendChild(line);
    });

    // Draw treble clef
    const clef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    clef.setAttribute('x', '15');
    clef.setAttribute('y', '55');
    clef.setAttribute('font-family', 'Noto Music');
    clef.setAttribute('font-size', '32');
    clef.setAttribute('fill', '#fff');
    clef.setAttribute('style', 'transform: scaleY(1.2) translateY(-8px)');
    clef.textContent = '𝄞';
    svgRef.current.appendChild(clef);

    // Draw accidentals using the existing data structures
    const accidentalOrder = keySignature.accidentalType === 'SHARP' ? SHARP_ORDER : FLAT_ORDER;
    const accidentalSymbol = keySignature.accidentalType === 'SHARP' ? '♯' : '♭';

    keySignature.accidentals.forEach((noteNumber, index) => {
      // Find the position of this note in the accidental order
      const orderIndex = accidentalOrder.indexOf(noteNumber);
      if (orderIndex !== -1) {
        const yPosition = getStaffPosition(noteNumber, keySignature.accidentalType);

        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        symbol.setAttribute('x', (50 + index * 9).toString());
        symbol.setAttribute('y', (yPosition + 3).toString());
        symbol.setAttribute('font-family', 'Noto Music');
        symbol.setAttribute('font-size', '32');
        symbol.setAttribute('font-weight', '900');
        symbol.setAttribute('fill', '#fff');
        symbol.textContent = accidentalSymbol;
        svgRef.current!.appendChild(symbol);
      }
    });
  }

  return (
    <svg
      ref={svgRef}
      width="200"
      height="80"
      viewBox="0 0 200 80"
      className="key-signature"
    />
  );
}
