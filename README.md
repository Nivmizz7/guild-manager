# WoW Guild Manager

Self-hosted web application for World of Warcraft guild management with Discord OAuth integration.

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
- **Discord OAuth authentication** with role-based permissions
  - Read-only mode for regular users
  - Full edit mode for users with admin role

## Installation

```bash
npm install
```

This command automatically installs all dependencies (backend and frontend).

## Configuration

### Discord OAuth Setup (Required for auth)

See **SETUP.txt** for detailed instructions on configuring Discord OAuth.

1. Create a Discord application
2. Get your Client ID and Secret
3. Configure the backend `.env` file:

```bash
cd backend
cp .env.example .env
# Edit .env with your Discord credentials
```

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

## Permission System

- **Not logged in**: Read-only access
- **Discord login without admin role**: Read-only access
- **Discord login with admin role**: Full access (create, edit, delete)

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
npm install
# Configure Discord OAuth in backend/.env
npm start
```

## REST API

The backend exposes a complete REST API on port 3001:

**Authentication**
- GET /api/auth/discord - Get Discord OAuth URL
- GET /api/auth/discord/callback - OAuth callback
- GET /api/auth/me - Get current user
- POST /api/auth/logout - Logout

**Configuration**
- GET /api/config (public)
- POST /api/config (admin only)

**Guild**
- GET /api/guild (public)
- PUT /api/guild (admin only)

**Members**
- GET /api/members (public)
- POST /api/members (admin only)
- PUT /api/members/:id (admin only)
- DELETE /api/members/:id (admin only)

**Calendar**
- GET /api/calendar (public)
- POST /api/calendar (admin only)
- DELETE /api/calendar/:id (admin only)

**Raids**
- GET /api/raids (public)
- POST /api/raids (admin only)
- PUT /api/raids/:id (admin only)
- DELETE /api/raids/:id (admin only)

**Loot**
- GET /api/loot (public)
- GET /api/loot/member/:memberId (public)
- POST /api/loot (admin only)

## Available Commands

```bash
npm install    # Complete installation (backend + frontend)
npm start      # Start the application
npm run build  # Build the backend
npm run clean  # Clean builds and data
```

## Technologies

- Backend: Node.js, Express, TypeScript, Discord OAuth2
- Frontend: Nuxt 3, Vue 3, TypeScript
- Storage: JSON files (fs)
- Authentication: Discord OAuth with session management
- No Docker, no database

## Requirements

- Node.js 18 or higher
- NPM 9 or higher
- Discord application (for OAuth)

## License

MIT
