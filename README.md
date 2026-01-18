# WoW Guild Manager

Application web de gestion de guilde World of Warcraft autonome et auto-hebergee.

## Description

Application locale permettant la gestion complete d'une guilde World of Warcraft sans base de donnees, uniquement avec des fichiers JSON locaux.

Fonctionnalites :
- Gestion des membres (classe, role, specialisation)
- Planification des raids et donjons
- Calendrier d'evenements
- Suivi du loot
- Interface thematique WoW (Horde/Alliance)
- Support toutes versions (Vanilla a The War Within)

## Installation

```bash
npm install
```

Cette commande installe automatiquement toutes les dependances (backend et frontend).

## Demarrage

```bash
npm start
```

L'application sera accessible sur :
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

Au premier lancement, un assistant de configuration vous guidera pour :
- Definir le nom de la guilde
- Choisir la faction (Horde/Alliance)
- Selectionner la version du jeu

## Architecture

```
/
├── backend/          Express + TypeScript (API REST)
├── frontend/         Nuxt 3 + Vue 3 (Interface)
├── data/            Stockage JSON (cree automatiquement)
└── package.json     Scripts NPM
```

## Stockage des donnees

Toutes les donnees sont stockees dans le dossier `/data` sous forme de fichiers JSON :
- config.json - Configuration de la guilde
- guild.json - Informations generales
- members.json - Liste des membres
- raids.json - Raids planifies
- calendar.json - Evenements
- loot.json - Historique du loot

## Deploiement multi-guildes

Chaque copie du dossier represente une guilde independante :

```bash
cp -r wow-guild-manager/ ma-guilde/
cd ma-guilde/
npm start
```

## API REST

Le backend expose une API REST complete sur le port 3001 :

**Configuration**
- GET /api/config
- POST /api/config

**Guilde**
- GET /api/guild
- PUT /api/guild

**Membres**
- GET /api/members
- POST /api/members
- PUT /api/members/:id
- DELETE /api/members/:id

**Calendrier**
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

## Commandes disponibles

```bash
npm install    # Installation complete (backend + frontend)
npm start      # Demarrage de l'application
npm run build  # Build du backend
npm run clean  # Nettoyage des builds et donnees
```

## Technologies

- Backend: Node.js, Express, TypeScript
- Frontend: Nuxt 3, Vue 3, TypeScript
- Stockage: Fichiers JSON (fs)
- Pas de Docker, pas de base de donnees

## Configuration requise

- Node.js 18 ou superieur
- NPM 9 ou superieur

## Licence

MIT
