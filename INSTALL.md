# Quick Start

## Installation

```bash
npm install
```

This command automatically installs all dependencies (backend + frontend).

## Launch

```bash
npm start
```

The application starts automatically:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

Open your browser at http://localhost:3000

## First Launch

On first access, you will see a configuration wizard:
1. Enter your guild name
2. Choose your faction (Horde or Alliance)
3. Select the WoW version
4. Click "Create Guild"

## Structure

- /backend - REST API (Express + TypeScript)
- /frontend - Web interface (Nuxt 3 + Vue)
- /data - JSON storage (auto-created)

## Commands

- `npm install` - Complete installation
- `npm start` - Start the application
- `npm run build` - Build the backend
- `npm run clean` - Clean builds and data
