// Ember Court — the loop, the screen flow and the wiring.
// One job: own the animation frame, advance the clock, feed clicks and
// keys to the state, and hand the state to the renderer. Rules live in
// state.js, drawing in render.js, sound in audio.js.

import { VIEW_H, VIEW_W } from './config.js';
import { createInput, pointInRect } from './input.js';
import { render, handRects, endTurnRect } from './render.js';
import { endPlayerTurn, newGame, playerPlayCard, updateRival } from './state.js';
import { stageShot } from './shots.js';
import { ensureAudio, sfx } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isFinite(seedParam) ? seedParam : (Date.now() % 2147483647);

let state;
const shotName = params.get('shot');
if (shotName) {
  state = stageShot(shotName, seed) ?? newGame(seed);
} else {
  state = newGame(seed);
}

const input = createInput(canvas);

function startGame() {
  ensureAudio();
  state.screen = 'play';
  state.startedAt = performance.now();
  sfx.turn();
}

function restart() {
  state = newGame((Date.now() % 2147483647) || 1);
  state.screen = 'play';
  ensureAudio();
  sfx.turn();
}

function handleClick(p) {
  ensureAudio();
  if (state.screen === 'title') {
    startGame();
    return;
  }
  if (state.screen === 'win' || state.screen === 'loss') {
    restart();
    return;
  }
  if (state.phase !== 'player') return;
  // End Turn button first: it overlaps nothing, but check it before cards.
  if (pointInRect(p, endTurnRect())) {
    endPlayerTurn(state);
    sfx.turn();
    return;
  }
  for (const rect of handRects(state)) {
    if (pointInRect(p, rect)) {
      if (playerPlayCard(state, rect.index)) {
        sfx.playCard();
        if (state.screen === 'win') sfx.win();
      } else {
        sfx.click();
      }
      return;
    }
  }
}

function handleKey(key) {
  ensureAudio();
  if (key === 'Enter' || key === ' ') {
    if (state.screen === 'title') startGame();
    else if (state.screen === 'play' && state.phase === 'player') endPlayerTurn(state);
    else if (state.screen === 'win' || state.screen === 'loss') restart();
    return;
  }
  if (key === 'r' || key === 'R') {
    if (state.screen !== 'title') restart();
    return;
  }
  if (state.screen === 'play' && state.phase === 'player') {
    const n = Number.parseInt(key, 10);
    if (n >= 1 && n <= state.piles.hand.length) {
      if (playerPlayCard(state, n - 1)) {
        sfx.playCard();
        if (state.screen === 'win') sfx.win();
      }
    }
  }
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(100, now - last);
  last = now;
  // Staged shots freeze the clock so the arranged scene (last played card,
  // floaters, title pulse) is exactly what the screenshot captures.
  state.now = shotName ? 900 : now;

  // Expire floaters (on the state's clock, frozen for staged shots).
  if (state.floaters.length > 0) {
    state.floaters = state.floaters.filter((f) => state.now - f.born < f.life);
  }
  updateRival(state, dt);
  if (state.screen === 'loss' && !state._lossSound) {
    state._lossSound = true;
    sfx.loss();
  }

  if (input.click) {
    const p = input.click;
    input.click = null;
    handleClick(p);
  }
  if (input.key) {
    const k = input.key;
    input.key = null;
    handleKey(k);
  }

  render(ctx, state, input.mouse);
  requestAnimationFrame(frame);
}

// Exposed for headless play-testing: window.__game.state is the live state.
window.__game = { get state() { return state; }, startGame, restart };
requestAnimationFrame(frame);
