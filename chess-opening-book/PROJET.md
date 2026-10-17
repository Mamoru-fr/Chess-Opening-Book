# PROJET — Chess Opening Book

**Source de vérité du chantier.** Les issues GitHub ne sont qu'un miroir ; en cas de divergence, ce fichier gagne.

## Objectif

Un « chess.com des ouvertures » : organiser ses ouvertures en dossiers et arbres (notation algébrique), les annoter visuellement (flèches, carrés colorés, notes), les analyser (meilleur coup), les tester (modes Puzzle/Drill), et à terme confronter ses ouvertures et jouer contre une IA qui y répond.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · ReactFlow (@xyflow/react) · chess.js · better-auth (sans plugin admin) · Drizzle ORM · PostgreSQL Neon (driver neon-http) · i18next (fr par défaut) · Playwright (e2e) · Vitest (unitaires)

## AUDIT — 17/10/2026 (Ada, session 1) : 19 constats, 6 bloquants — TRAITÉS en Phase A+B le jour même

Constats détaillés : voir commit « docs: audit session 1 » (1er push du 17/10). Résumé et statut :

### 🔴 Bloquants — tous corrigés le 17/10/2026 (Phase A)
1. ✅ signActions mortes avec redirects /connections → **fichier supprimé** (jamais importé ; signin/signup passent par authClient côté client).
2. ✅ Déconnexion inerte → `authClient.signOut()` + redirection /auth/signin.
3. ✅ Lien Dossiers → /folders inexistant → retiré de la nav.
4. ✅ Rules of Hooks violées (3 useCallback inline dans le JSX) → hoistés dans le corps du composant.
5. ✅ Pas de .env.example + DATABASE_URL! non gardé → .env.example versionné + erreur explicite si absent (console.log d'init retiré).
6. ✅ Stockfish mort (API inventée) → stockfish.ts et dépendance supprimés ; réintégration Phase C via worker UCI.
7. ✅ (découvert pendant la passe) Suppression de nodes/edges silencieusement ignorée : onNodesUpdate/onEdgesUpdate traitaient des listes complètes comme des « changes » → désormais setNodes/setEdges directs.

### 🟠 Majeurs — corrigés (Phase B)
8. ✅ better-auth, drizzle-orm, @neondatabase/serverless, dotenv passés en dependencies ; pg/react-dnd(×2)/stockfish.wasm/zustand/tsx supprimés (jamais importés ; type OpeningNodeData déplacé dans types/index.ts).
9. ✅ Rôles driver/customer (trace d'un autre projet) → enum supprimé, `role text default 'user'` ; plugin admin better-auth retiré (décision Alexis).
10. ✅ e2e périmé (localStorage openingTreeNodes) → rewrite en tests de fumée honnêtes ; port 3000 aligné sur le README.
11. ✅ migrations drizzle versionnées (/drizzle retiré du .gitignore, /drizzle/meta ignoré) ; scripts db clarifiés (generate / migrate / push séparés) ; test-results/ ignoré + supprimé du repo.
12. ✅ i18next : fr par défaut, debug off. (l'UI en dur reste majoritairement FR — i18n réel = Phase C+)

### 🟡 Mineurs restants ( Phase C)
13. ⏳ saveNodeAnnotation : check-then-insert → upsert onConflictDoUpdate.
14. ⏳ lib/chess/chess.ts : helpers non importés — à brancher ou supprimer.
15. ⏳ pnpm-lock.yaml à régénérer (`pnpm install`) : les deps ont changé, la sandbox ne permet pas l'install — **première commande à lancer localement**.
16. ⏳ Gate non exécutée : `pnpm typecheck && pnpm lint && pnpm build && pnpm test:unit` à lancer localement (installation impossible en sandbox) — voir « À vérifier ».

## À vérifier par Alexis (gate de session — avant de considérer A+B acquis)
1. `pnpm install` (régénère le lockfile)
2. `cp .env.example .env.local` + remplir DATABASE_URL (Neon) et BETTER_AUTH_SECRET
3. `pnpm db:generate && pnpm db:push` (ou migrate)
4. `pnpm typecheck && pnpm lint && pnpm build`
5. `pnpm dev` → signup → dashboard → créer une ouverture → jouer e4 sur le plateau → sauvegarder → Déconnexion (vérifier que ça déconnecte vraiment)

## Décisions Alexis (17/10/2026)
- Driver DB : **Neon serverless** (Vercel-friendly).
- Phase A+B en une passe, Phase C discutée ensuite. ✔ Fait.
- Stockfish : débranché proprement maintenant, réintégration en Phase C (implémentation correcte : WASM + worker UCI).
- Plugin admin better-auth supprimé (rôles simples).

## Phase C — à discuter (prochaine session)
- Analyse réelle : Stockfish via worker UCI (ou alternative : lichess cloud eval — décision).
- Drill sur le plateau (cliquer les coups au lieu de les taper), indication du camp à jouer.
- Confrontation d'ouvertures / jouer son répertoire contre l'IA.
- Upsert annotations, i18n réel, cleanup lib/chess.

## Phase D — vitrine (après C)
- Build vérifié, déploiement (Vercel+Neon présumé), transfert vers l'org alexis-aam-santos à maturité.

## Changelog
- **17/10/2026 (session 1, Ada)** : audit complet (19 constats, 6 bloquants + 1 découvert en passant) → PROJET.md/AGENTS.md/.env.example créés ; Phase A exécutée (6 corrections) ; Phase B exécutée (12 corrections + 7 fichiers morts supprimés : signActions, SessionContext, isValidUserRole, database_types/auth, stockfish.ts, lib/store.ts, test-results) ; landing et README rendus honnêtes sur Stockfish (Phase C). Gate d'exécution à lancer par Alexis (sandbox sans install).
