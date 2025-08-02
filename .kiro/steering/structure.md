# Project Structure

## Root Directory
```
├── src/                 # Source code
├── .kiro/              # Kiro AI assistant configuration
├── .vscode/            # VS Code settings
├── node_modules/       # Dependencies
├── index.html          # Main HTML entry point
├── package.json        # Project configuration
├── vite.config.ts      # Vite build configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # TailwindCSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Source Structure (`src/`)
```
src/
├── main.ts             # Application entry point
├── scenes/             # Phaser game scenes
├── managers/           # Game state and UI managers
├── stores/             # Zustand state stores
├── ui/                 # UI components and overlays
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── styles/             # CSS and styling files
```

## Architecture Patterns

### Import Aliases
- `@/` - Points to `src/` directory
- `@/scenes/` - Game scenes
- `@/ui/` - UI components
- `@/managers/` - Manager classes
- `@/stores/` - Zustand state stores
- `@/types/` - Type definitions
- `@/utils/` - Utility functions

### File Organization
- **Scenes**: Phaser game scenes go in `src/scenes/`
- **Managers**: Singleton managers (UI, Modal, etc.) in `src/managers/`
- **Stores**: Zustand state stores in `src/stores/`
- **Types**: All TypeScript interfaces and types in `src/types/`
- **Utils**: Reusable utilities and helpers in `src/utils/`
- **UI**: DOM-based UI components in `src/ui/`
- **Styles**: CSS files in `src/styles/`

### HTML Structure
- `#game-container` - Phaser game canvas container
- `#modal-container` - Dynamic modal overlays (z-index: 50)
- `#ui-overlay` - Game UI elements (z-index: 40)

### Naming Conventions
- Use PascalCase for classes and components
- Use camelCase for variables and functions
- Use kebab-case for CSS classes (TailwindCSS)
- Scene files should end with "Scene" (e.g., `MainScene.ts`)
- Manager files should end with "Manager" (e.g., `UIManager.ts`)