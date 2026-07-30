# Patrimoine — tableau de bord financier (Alex & Léa)

Application React (Vite) de gestion de patrimoine personnel, connectée à Supabase
(authentification par compte partagé + base de données + fonction serveur pour les cours de bourse).

## Démarrer en local

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

## Build de production

```bash
npm run build
```

## Architecture

- `src/lib/` — catalogues métier (types de comptes, banques, titres) et calculs financiers purs, testés unitairement
- `src/context/` — `AuthContext` (compte Supabase) et `DataContext` (synchronisation des données)
- `src/components/` — interface (barre latérale, onglets, modales)
- `supabase/functions/quote/` — fonction serveur qui récupère les cours de bourse (clé API cachée côté serveur)

## État de la migration (depuis la version HTML monofichier)

✅ Authentification (porte d'entrée obligatoire, compte partagé)
✅ Synchronisation des données avec Supabase
✅ Onglet Vue d'ensemble
✅ Onglet Revenus & dépenses (ajout simple)
🚧 Onglet Épargne & patrimoine (dont PEA/CTO dépliables) — à porter
🚧 Onglet Projets & échéances — à porter
🚧 Onglet Recommandations — à porter
🚧 Import de relevé bancaire — à porter
🚧 Tutoriel de première utilisation — à porter
🚧 Éditeur de fiche générique (pop-up) — à porter (actuellement formulaires simplifiés inline)
