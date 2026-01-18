# Demarrage rapide

## Installation

```bash
npm install
```

Cette commande installe automatiquement toutes les dependances (backend + frontend).

## Lancement

```bash
npm start
```

L'application demarre automatiquement :
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

Ouvrez votre navigateur sur http://localhost:3000

## Premier lancement

Au premier acces, vous verrez un assistant de configuration :
1. Entrez le nom de votre guilde
2. Choisissez votre faction (Horde ou Alliance)
3. Selectionnez la version de WoW
4. Cliquez sur "Creer la guilde"

## Structure

- /backend - API REST (Express + TypeScript)
- /frontend - Interface web (Nuxt 3 + Vue)
- /data - Stockage JSON (cree automatiquement)

## Commandes

- `npm install` - Installation complete
- `npm start` - Demarrer l'application
- `npm run build` - Build du backend
- `npm run clean` - Nettoyer les builds et donnees
