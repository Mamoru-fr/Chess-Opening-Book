# Chess Opening Book

Un carnet d'ouvertures d'échecs professionnel inspiré de Chess.com : arbres d'ouvertures annotables, drill de test, et (à venir, Phase C) l'analyse IA via Stockfish.

## 🎯 Objectifs du Projet

- 📚 **Organiser**: Dossiers et arbre d'ouvertures avec notation algébrique
- 🎯 **Analyser**: Annotations visuelles + statistiques de coups (analyse IA Stockfish : Phase C)
- ✏️ **Pratiquer**: Mode Drill pour tester vos connaissances (Mode Puzzle : à venir)

## 🚀 Démarrage Rapide

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon serverless — driver `neon-http`)
- pnpm (recommandé)

### Installation

```bash
# 1. Cloner et installer
git clone <repo>
cd chess-opening-book
pnpm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials BD et clés d'authentification

# 3. Générer & migrer la BD
pnpm db:generate
pnpm db:migrate

# 4. Démarrer le serveur
pnpm dev
```

Ouvrir http://localhost:3000

## 📁 Structure du Projet

```
chess-opening-book/
├── app/
│   ├── api/auth/[route]    # Endpoints authentification
│   ├── auth/               # Pages signin/signup
│   ├── dashboard/          # Dashboard principal
│   ├── openings/           # Visualiseur ouvertures
│   └── globals.css         # Styles globaux Chess.com
├── components/
│   ├── ChessBoard.tsx      # Plateau d'échecs interactif
│   ├── OpeningTree.tsx     # Arbre d'ouvertures (ReactFlow)
│   └── classicComponents/
├── lib/
│   ├── actions/
│   │   └── openingActions.ts  # Server actions CRUD
│   ├── auth/
│   │   ├── auth.ts            # Configuration better-auth
│   │   └── auth.client.ts     # Client auth
│   ├── db/
│   │   ├── schema.ts          # Schéma Drizzle ORM
│   │   └── drizzle.ts         # Connexion BD
│   └── chess/
│       └── chess.ts           # Helpers jeu d'échecs
├── locales/               # Traductions i18n
└── tests/                 # Tests Playwright
```

## 🔐 Authentification

- **Framework**: better-auth (sans plugin admin — rôles simples)
- **Method**: Email + Password
- **Base de données**: PostgreSQL/Neon (Drizzle ORM)
- **Session**: cookies HttpOnly gérés par better-auth

Pages:
- `/auth/signin` - Connexion
- `/auth/signup` - Inscription

## 📊 Structure Base de Données

### Tables principales:
- `users` - Utilisateurs (id TEXT PK, role TEXT default 'user')
- `folders` - Dossiers d'ouvertures
- `openings` - Ouvertures avec nodesData/edgesData
- `node_annotations` - Annotations (notes, flèches, carrés colorés)

## 🎮 Fonctionnalités Implémentées

### Phase 1 ✅
- ✅ Schéma BD optimisé
- ✅ Authentification avec better-auth
- ✅ Server actions CRUD
- ✅ Dashboard avec gestion dossiers/ouvertures
- ✅ Visualiseur ouvertures (3 onglets)
- ✅ Style Chess.com

### Phase 2 🔄 (En cours)
- 🔄 Drag & drop réorganisation nodes
- 🔄 Collapse/expand branches
- 🔄 Notation algébrique automatique
- 🔄 Multi-select + coloration nodes

### Phase 3 (À venir)
- ⏳ Interactions plateau (Alt+Click flèches, Ctrl+Click carrés)
- ⏳ Slider taille plateau
- ⏳ Sauvegarde annotations en BD

### Phase 4 (À venir) — voir PROJET.md
- ⏳ Analyse réelle par IA (Stockfish via worker UCI — Phase C)
- ⏳ Drill sur le plateau (cliquer les coups, pas seulement les taper)
- ⏳ Confronter des ouvertures / jouer son répertoire contre l'IA

## 🛠 Scripts NPM

```bash
pnpm dev            # Démarrer serveur dev
pnpm build          # Build production
pnpm start          # Démarrer serveur production
pnpm lint           # Vérifier code
pnpm typecheck      # TypeScript strict
pnpm test:unit      # Vitest
pnpm db:generate    # Générer migrations Drizzle
pnpm db:migrate     # Appliquer migrations
pnpm db:push        # Pousser le schéma directement (dev rapide)
pnpm test:e2e       # Tester avec Playwright
```

## 🎨 Design

- **Inspiration**: Chess.com
- **Framework UI**: Tailwind CSS
- **Composants**: Lucide React
- **Graphe**: ReactFlow

## 🔧 Variables d'Environnement

```env
# Base de données PostgreSQL (Neon)
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Authentication better-auth
BETTER_AUTH_SECRET=<generate-with-openssl-rand-hex-32>
BETTER_AUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes, better-auth
- **Base de données**: PostgreSQL (Neon) + Drizzle ORM
- **UI**: Tailwind CSS, Lucide React
- **Graphe**: ReactFlow
- **Échecs**: chess.js (Stockfish WASM : réintégration prévue en Phase C)
- **I18n**: i18next
- **Tests**: Playwright, Vitest
