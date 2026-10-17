# PROJET — Chess Opening Book

**Source de vérité du chantier.** Les issues GitHub ne sont qu'un miroir ; en cas de divergence, ce fichier gagne.

## Objectif

Un « chess.com des ouvertures » : organiser ses ouvertures en dossiers et arbres (notation algébrique), les annoter visuellement (flèches, carrés colorés, notes), les analyser (meilleur coup), les tester (modes Puzzle/Drill), et à terme confronter ses ouvertures et jouer contre une IA qui y répond.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · ReactFlow (@xyflow/react) · chess.js · better-auth · Drizzle ORM · PostgreSQL (Neon, driver neon-http) · i18next (fr/en) · Playwright (e2e) · Vitest (unitaires)

## État au 17/10/2026 (audit Ada, session 1)

Phase 1 (foundation) largement en place : schéma DB complet (users/session/account/verification/folders/openings/node_annotations), auth email+mdp fonctionnelle côté serveur, CRUD server actions avec vérification de propriété, dashboard, éditeur d'arbre + plateau avec annotations, onglets Analyse (stats maison) et Test (drill de base). **Mais le projet ne tourne pas de bout en bout** : voir l'audit.

## AUDIT — 17/10/2026 (Ada, diagnostic sans exécution ; installation de packages impossible dans la sandbox de la session)

### 🔴 Bloquant — empêche le fonctionnement de bout en bout

1. **signActions.ts redirige vers /connections?view=...** — cette route n'existe pas. Les pages vivent à /auth/signin et /auth/signup. Toute erreur de connexion/inscription renvoie l'utilisateur vers une 404.
2. **Bouton Déconnexion inerte** (app/(auth-required)/layout.tsx) : router.push("/") seulement, jamais authClient.signOut() ni la server action signout → l'utilisateur reste connecté.
3. **Lien « Dossiers » → /folders** dans la nav du layout auth-required : page inexistante (les dossiers sont gérés dans le dashboard).
4. **Violation des Rules of Hooks dans app/openings/[id]/page.tsx** : trois useCallback appelés inline dans les props JSX de OpeningTree. Au premier changement d'onglet (editor/analysis/testing), React re-render avec un nombre d'appels de hooks différent → crash garanti en runtime.
5. **Pas de DATABASE_URL = écran mort** : lib/db/drizzle.ts fait neon(process.env.DATABASE_URL!) au niveau module, avec console.log d'init à l'import. Aucun .env.example versionné (le README renvoie pourtant à cp .env.example .env.local).
6. **Stockfish est du code mort** : l'onglet Analyse est désactivé (« disabled for now due to build issues »), lib/chess/stockfish.ts utilise une API inventée (sf.setFen/setDepth/calculateBestMove — ce n'est pas l'API de stockfish.wasm, qui expose UCI via worker). La dépendance stockfish.wasm@^0.10.0 est dans package.json pour rien.

### 🟠 Majeur — dette et incohérences

7. **Désaccord driver DB** : code = drizzle-orm/neon-http + @neondatabase/serverless (dépendance en devDependencies alors qu'elle est importée en runtime) ; README = « PostgreSQL 12+ » ; pg est en dépendance mais jamais importé.
8. **better-auth + drizzle-orm en devDependencies** — ils tournent en production ; doivent être en dependencies.
9. **Rôles hérités d'un autre projet** : user_role = ['admin','driver','customer'], defaultRole "customer" — 'driver' n'a aucun sens pour un carnet d'échecs (trace de template d'un autre domaine). À renommer (ex. admin/user).
10. **Tests e2e périmés** : tests/e2e.spec.ts vérifie un localStorage.getItem('openingTreeNodes') qui n'existe plus (l'état vit en base via server actions) → test rouge garanti. Playwright sur port 3002 vs README 3000.
11. **Dossier test-results/ versionné** (artefact) ; vitest et tsx en dependencies sans script de test unitaire (test:unit manquant) ; react-dnd + react-dnd-html5-backend jamais importés ; zustand quasi inutilisé (types seulement).
12. **Dossier migrations drizzle ignoré** (.gitignore contient /drizzle) → pnpm db:migrate d'un fresh clone ne peut pas appliquer de migrations versionnées.
13. **Scripts db ambigus** : db:migrate = drizzle-kit generate && drizzle-kit migrate et db:generate = generate && push — générer dans les deux, push en écrase la sémantique migrationnelle.

### 🟡 Mineur

14. console.log d'init DB à l'import (bruit serveur).
15. saveNodeAnnotation : check-existe-puis-insert (race possible) → upsert onConflictDoUpdate.
16. Couche context/SessionContext.tsx quasi dupliquée avec auth.client (useSession better-auth) — deux systèmes de session en parallèle, dont un qui parle de 'driver'.
17. i18next initialisé avec lng:'en' alors que l'UI est massivement en dur en français dans les pages ; debug: true en prod.
18. Pas de PROJET.md, pas d'AGENTS.md, pas de carte — c'est le présent fichier qui ouvre la série.

## Plan de remise en route (proposé, en attente de GO Alexis)

**Phase A — Faire tourner (bloquants 1–6)**
- Corriger les redirects vers /auth/signin?error=... ; brancher la déconnexion sur authClient.signOut() + action ; supprimer le lien /folders ; sortir les trois useCallback du JSX vers le corps du composant ; créer .env.example ; retirer le console.log et le DATABASE_URL! non gardé ; retirer stockfish.wasm + stockfish.ts (ou le réimplémenter proprement en Phase C).

**Phase B — Hygiène**
- Reclasser les deps runtime ; unifier le driver (neon-http OU pg — décision Alexis) ; renommer l'enum role ; supprimer test-results/, react-dnd ; script test:unit ; rewriter l'e2e contre le flux réel (signup → dashboard → création d'ouverture → coup e4 via le plateau) ; versionner les migrations ; rattraper le README.

**Phase C — Le cœur du produit (fonctionnalités manquantes vs objectif)**
- Analyse réelle : intégrer Stockfish via WASM worker UCI correct, ou moteur serveur (décision).
- Test/Drill : jouer les coups sur le plateau (pas seulement en saisie texte), indiquer le camp à jouer, navigation arbre.
- Suivant : confrontation d'ouvertures, jouer contre l'IA un repertoire.

**Phase D — Vitrine**
- Quand A–C tiennent : build vérifié, puis transfert org.

## Décisions en attente (Alexis)

1. Driver DB : Neon serverless ou pg classique + Postgres local ? (impose le mode de dev et de déploiement)
2. Rôles : garder better-auth admin plugin avec quels rôles ?
3. Stockfish : réintégrer maintenant (Phase C) ou débrancher jusqu'à la Phase C ?
4. Déployer où ? (Vercel+Neon, VPS, local)

## Changelog

- **17/10/2026** — Session 1 (Ada) : audit complet du repo, 18 constats (6 bloquants), plan A–D proposé, création de ce PROJET.md. Pas de code modifié.
