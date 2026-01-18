# WoW Guild Manager

Self-hosted web application for World of Warcraft guild management.

## Description

Local application for complete World of Warcraft guild management without a database, using only local JSON files.

Features:
- Member management (class, role, specialization)
- Raid and dungeon planning
- Event calendar
- Loot tracking
- WoW themed interface (Horde/Alliance)
- Support for all versions (Vanilla to The War Within)
- Multi-language support (FR/EN)

## Installation

```bash
npm install
```

This command automatically installs all dependencies (backend and frontend).

## Starting

```bash
npm start
```

The application will be accessible at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

On first launch, a setup wizard will guide you to:
- Define the guild name
- Choose the faction (Horde/Alliance)
- Select the game version

## Architecture

```
/
├── backend/          Express + TypeScript (REST API)
├── frontend/         Nuxt 3 + Vue 3 (Interface)
├── data/            JSON storage (auto-created)
└── package.json     NPM scripts
```

## Data Storage

All data is stored in the `/data` folder as JSON files:
- config.json - Guild configuration
- guild.json - General information
- members.json - Members list
- raids.json - Planned raids
- calendar.json - Events
- loot.json - Loot history

## Multi-Guild Deployment

Each folder copy represents an independent guild:

```bash
cp -r wow-guild-manager/ my-guild/
cd my-guild/
npm start
```

## REST API

The backend exposes a complete REST API on port 3001:

**Configuration**
- GET /api/config
- POST /api/config

**Guild**
- GET /api/guild
- PUT /api/guild

**Members**
- GET /api/members
- POST /api/members
- PUT /api/members/:id
- DELETE /api/members/:id

**Calendar**
- GET /api/calendar
- POST /api/calendar
- DELETE /api/calendar/:id

**Raids**
- GET /api/raids
- POST /api/raids
- PUT /api/raids/:id
- DELETE /api/raids/:id

**Loot**
- GET /api/loot
- GET /api/loot/member/:memberId
- POST /api/loot

## Available Commands

```bash
npm install    # Complete installation (backend + frontend)
npm start      # Start the application
npm run build  # Build the backend
npm run clean  # Clean builds and data
```

## Technologies

- Backend: Node.js, Express, TypeScript
- Frontend: Nuxt 3, Vue 3, TypeScript
- Storage: JSON files (fs)
- No Docker, no database

## Requirements

- Node.js 18 or higher
- NPM 9 or higher

## License

MIT
