# Technology Stack

## Core Technologies

- **TypeScript 5.0+** - Primary language with strict type checking
- **Phaser 3.70+** - Game engine for 2D game development
- **Vite 5.0+** - Build tool and development server
- **TailwindCSS 3.3+** - Utility-first CSS framework
- **PostCSS** - CSS processing with Autoprefixer
- **Zustand** - Lightweight state management for global state and complex logic

## Build System

- **Vite** as the primary build tool and dev server
- **TypeScript compiler** for type checking and compilation
- **Rollup** (via Vite) for production bundling with Phaser code splitting

## Development Setup

- ES2020 target with ESNext modules
- Strict TypeScript configuration with unused variable checking
- Path aliases configured for clean imports (@/, @/scenes/, @/ui/, etc.)
- Hot module replacement in development

## Common Commands

```bash
# Development server (runs on port 3000, auto-opens browser)
npm run dev

# Production build (type check + build)
npm run build

# Preview production build
npm run preview

# Type checking only (no compilation)
npm run type-check
```

## State Management with Zustand

- **Use Zustand instead of Redux** for global state and complex logic
- Create stores in `src/stores/` directory
- Use TypeScript interfaces for store state typing
- Prefer multiple small stores over one large store
- Use Zustand's immer middleware for complex state updates
- Store files should end with "Store" (e.g., `gameStore.ts`, `uiStore.ts`)

## Code Style Requirements

- Use strict TypeScript with all compiler checks enabled
- Import paths should use configured aliases (@/ for src/)
- ES modules only (type: "module" in package.json)
- Phaser should be code-split in production builds
