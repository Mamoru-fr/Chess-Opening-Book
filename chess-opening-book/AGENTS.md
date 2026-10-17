# AGENTS.md — Chess Opening Book

Méthode de chantier : skill **tour-de-main** (réutiliser avant créer · plan avant modif · TDD-first sur le cœur · gate pre-commit · question à chaque doute · le tech lead tranche).

- **Source de vérité** : PROJET.md (ce fichier n'est qu'un pointeur).
- **Architecture en couches** : composants → server actions (validation entrée) → lib/ services → Drizzle. Jamais de logique métier ni de SQL inline dans un composant.
- **Ne pas lire/attacher** : pnpm-lock.yaml, node_modules, .next/, test-results/, drizzle/ généré.
- **Convention** : code en anglais, UI FR (i18next), commits impératifs courts.
- **Ne jamais recopier** les zones listées « code mort » dans l'audit du PROJET.md (stockfish.ts actuel, SessionContext, react-dnd) sans décision explicite.
