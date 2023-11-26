const notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
type Note = typeof notes[number];

type ScaleNotes = Note[];
type ScaleLabels = string[];

type Sequence = {
  notes: ScaleNotes,
  labels: ScaleLabels
}
