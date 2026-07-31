# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fyra (formerly "Patrimoine") — a personal/family finance dashboard: incomes, expenses, savings/investment accounts (including PEA/CTO stock positions), projects/deadlines, and an overview with recommendations. Up to 6 profiles per household (individual or shared), with an owner filter across all tabs. React 19 + Vite SPA, no router (tab state in `App.jsx`), backed by Supabase (auth + Postgres + one Edge Function). Deployed on Vercel. French UI/UX copy throughout — match that when adding user-facing text.

## Commands

```bash
npm run dev      # start Vite dev server (also runnable via the "patrimoine-dev" preview config in .claude/launch.json)
npm run build     # production build
npm run lint      # oxlint (rules: react/rules-of-hooks error, react/only-export-components warn)
npm test          # vitest run (all tests, single run)
npx vitest        # watch mode
npx vitest run src/lib/metrics.test.js   # single test file
npx vitest run -t "calcule revenu"       # single test by name
```

No test script exists for the Supabase Edge Function (`supabase/functions/quote/`) — it's Deno code, not part of the Vite/Vitest build.

## Architecture

**State flow**: `main.jsx` wraps `<App/>` in `AuthProvider` → `DataProvider`. `AuthContext` holds the Supabase session (email/password auth only — no signup email confirmation bypass; see `signUp` error message in `AuthContext.jsx`). `DataContext` holds the single household state object (`blankState()` shape: `{ incomes, expenses, accounts, projects, savings, profiles, ui }`) and syncs it to the `household_state` Postgres table (one row per `user_id`, whole-state JSON blob) — pulled on login and every 20s, pushed 400ms after any `updateState()` call (debounced). There is no per-field API; every write replaces the whole state blob.

**Tab components never call Supabase directly** — they only read `state` and call `updateState(updater)` from `useData()`. All persistence/sync logic is centralized in `DataContext.jsx`.

**`src/lib/` is pure, framework-free business logic**, unit-tested in `*.test.js` files alongside it:
- `catalogs.js` — static reference data (account `TYPES` with tier/liquidity/default rate, `BANKS`, `EXPENSE_CATS`, `SECURITIES` for the stock autocomplete). Keys here are persisted in Supabase — renaming a type/category key is a data migration, not just a refactor.
- `metrics.js` — all financial calculations (`computeMetrics`, `accVal`, `projNextDate`, sorting helpers) plus the state shape contract (`blankState`, `normalizeState` — the migration path for state saved by older schema versions, e.g. missing `owner`/`bank`/`positions` fields).
- `format.js` — French (`fr-FR`) number/date/currency formatting helpers.

**`App.jsx`** is a plain tab switcher (no react-router): `TABS = { overview, flow, wealth, projects, reco }`, tab stored in `useState`, with a slide-left/slide-right CSS animation driven by comparing tab order indices. Gate order on mount: loading session → `AuthGate` (no session) → loading data → `ProfileGate` (no profiles yet) → normal app.

**`src/components/tabs/`** hold one component per tab; most follow the same internal pattern: an `Add*Form`/`*Form` component for creating a record, and a `*Row` component with local `editing` state that swaps itself for an inline edit form (no modal) when editing. `Wealth.jsx` additionally nests expandable stock positions (`AccountPositions`/`PositionRow`) under PEA/CTO accounts, with a debounced-blur autocomplete (`SecurityField`) that matches against `catalogs.SECURITIES`.

**Styling**: single global stylesheet `src/styles/global.css`, no CSS modules/CSS-in-JS. Shared classes (`.iconbtn`, `.form-row`, `.two`, `.card`, `.ledger`, etc.) are reused across tabs — fix the class, not each usage. Two breakpoints: `1040px` (KPI/bar-chart grid reflow) and `760px` (sidebar becomes a bottom `.mobile-tabbar` + burger `.more-panel`, `.ledger` tables become stacked cards via `data-label` attributes, forms stack to one field per row). The app targets touch/mobile as a first-class layout, not just desktop-with-squeeze.

**Stock quotes**: `Wealth.jsx`'s `fetchQuote()` calls the `quote` Supabase Edge Function (`supabase/functions/quote/index.ts`), which proxies Twelve Data and converts to EUR server-side so the API key never reaches the client. European tickers are passed with their exchange suffix (e.g. `EWLD.PA`) rather than a separate `exchange` param — mixing the two makes Twelve Data reject the request.

**Data ownership/filtering**: every record (`income`, `expense`, `account`, `saving`, `project`) has an `owner` field referencing a profile id, or `'commun'`/a shared-profile id for household-wide items. `activeSet()`/`matchOwner()` in `metrics.js` are the single filtering logic used everywhere the owner-filter pills (`Topbar.jsx`) apply.

## Notes

- `src/lib/supabaseClient.js` hardcodes the Supabase URL and anon key (anon key is safe to expose; it's not a secret). This is intentional continuity from the pre-migration app, not an oversight.
- `README.md` tracks migration status from an older single-file HTML version — statement import, first-run tutorial, and a generic record-editor popup are listed there as not-yet-ported.
