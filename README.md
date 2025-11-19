# NightingaleNotes

A helper utility GUI for music composition and analysis. Explore scales, chords, and key signatures with an interactive piano keyboard interface.

## Demo

🎹 [Try it live](https://nightingale-notes.vercel.app/)

## Features

- **Interactive Piano Keyboard**: Visual piano interface with customizable octave ranges
- **Key Signatures**: Explore all major and minor key signatures with proper enharmonic spelling
- **Diatonic Chords**: View and play diatonic triads and seventh chords for any key
- **Scale Analysis**: Support for major, natural minor, harmonic minor, and melodic minor scales
- **Audio Playback**: Play scales and chords using Web Audio API
- **Keyboard Shortcuts**: Navigate and control the app using keyboard shortcuts (press keys to explore)
- **Accessibility**: Full keyboard navigation and haptic feedback support

## Development

### Prerequisites

- Node.js (18+)
- pnpm (10+)

### Installation

```bash
pnpm install
```

### Available Scripts

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Auto-fix linting issues
pnpm lint-fix
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
- **Web Audio API** - Sound generation
- **ESLint** - Code linting with Airbnb config

## Project Structure

```
src/
├── components/     # React components
├── context/        # React context providers
├── lib/            # Core music theory logic
│   ├── core/       # Primitives, scales, chords
│   ├── key-signatures/ # Key signature calculations
│   ├── theory/     # Music theory utilities
│   └── utils/      # Helper functions
└── __tests__/      # Test files
```

## License

MIT
