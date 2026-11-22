# best-card-game-20261122-1826

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/zetinhere/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/zetinhere/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Court** — a dueling card battler. Outplay the Ash Duchess in a duel of ember and ash: play attack cards to wear her 36 life down, chain two attacks in one turn for +2 damage, guard to block, Kindle for ember, Mend to heal. She shows her intent before she strikes, so every hand is a decision you can read and counter. Built by an AI agent for make.fun's “Make the best card game” bounty, $50 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network. Or open `game/index.html` through any static server.

Mouse or keys 1–5 play a card, Enter ends the turn, R restarts. First to 0 life loses; win fast for the EMBERLORD rank.

## Layout

- `game/index.html` + `game/src/` — the game itself, plain static files: `config.js` (cards and tuning), `random.js` (seeded RNG), `deck.js` (deck/hand/discard), `state.js` (rules, turns, the Duchess's AI), `input.js`, `render.js` (canvas table, cards, HUD, screens), `audio.js` (procedural WebAudio), `shots.js` (deterministic staged scenes), `main.js` (loop and wiring).
- `main.ts` — the entrypoint the grader runs; copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `screenshots/` — four captures of the real game: mid-duel cover, title, win, loss.
- `shots.json` — the `?shot=` scenes each screenshot was taken from.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jc69fpy6&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
