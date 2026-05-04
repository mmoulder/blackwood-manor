# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint (flat config in eslint.config.js)
```

There is no test suite. The README has a full list of required `VITE_*` environment variables — `.env` must exist before `npm run dev`.

## Architecture

This is a single-page React 19 + Vite app for an in-person team murder mystery event. There is no router library — `src/main.jsx` checks `window.location.pathname === '/admin'` and renders either `App` or `Admin`. `public/_redirects` (`/* /index.html 200`) is the Netlify SPA fallback that makes `/admin` work on deploy.

Three runtime systems interact:

1. **Game content & flow (`src/App.jsx`, ~1500 lines)** — All game data is co-located here as top-level constants: `SUSPECTS` (each with a Claude `system` prompt encoding their guilt/innocence and behavior), `CLUE_CHAIN` (10 sequential puzzles with `acceptedAnswers` arrays for fuzzy matching), `SOLUTION`, `TEAMS`, `TEAM_COLORS`. The screens (`Lobby` → `GameScreen` → `AccuseScreen`) are also defined in this file. **When changing puzzles or suspect behavior, edit only this file.**

2. **Suspect interrogation** — `askSuspect()` in `App.jsx` calls `https://api.anthropic.com/v1/messages` directly from the browser using `VITE_ANTHROPIC_API_KEY`. The key ships in the client bundle by design (this is a single-event party game, not a public-facing service); don't "fix" this by routing through a backend unless explicitly asked. Each suspect's deception/honesty is enforced entirely through the `system` prompt — gameplay logic does not police what suspects say.

3. **Multi-team sync (`src/useGameSync.js` + `src/firebase.js`)** — Firebase Realtime Database keyed by `games/${GAME_ID}/teams/${teamName}`. `GAME_ID` is a hardcoded string constant in `useGameSync.js` (currently `"blackwood-04-20-2026"`) and **must be updated for each new event** — otherwise teams join the previous event's data. `Leaderboard.jsx` and `Admin.jsx` both subscribe via `useAllTeams()`; `Admin.jsx`'s reset button wipes `games/${GAME_ID}` entirely.

## Editing puzzles

`acceptedAnswers` is matched after `.toLowerCase().replace(/\s+/g,"").replace(/[£,\.]/g,"")` normalization (see `Puzzle.check` in `App.jsx`). Add lenient variants there rather than relaxing the comparison. The `id` field on each clue is used as a React key and to reset puzzle state — keep ids stable when reordering.
