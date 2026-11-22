// Ember Court — staged scenes for screenshots.
// One job: given a fresh state, arrange one deterministic scene per shot
// name, so the screenshots are reproducible captures of the real game.
// The game itself is never faked: every scene is a legal state the rules
// could reach, rendered by the same renderer the player sees.

import { newGame } from './state.js';

function base(seed) {
  const state = newGame(seed);
  state.now = 900; // floaters and the title pulse read a fixed clock
  return state;
}

function logLines(state, lines) {
  state.log = lines.slice();
}

// Mid-duel table: the cover shot. A real turn-4 position, chain active,
// the Duchess mid-threat, the Knight's hand full of readable cards.
function stageCover(state) {
  state.screen = 'play';
  state.phase = 'player';
  state.turn = 4;
  state.player.hp = 24;
  state.player.shield = 5;
  state.player.ember = 2;
  state.player.maxEmber = 4;
  state.rival.hp = 17;
  state.rival.shield = 3;
  state.rival.ember = 4;
  state.rival.maxEmber = 4;
  state.piles.hand = ['hammer', 'slash', 'guard', 'kindle', 'fan'];
  state.piles.deck = ['slash', 'guard', 'mend', 'nova', 'wall', 'spark', 'slash', 'guard'];
  state.piles.discard = ['slash', 'kindle', 'guard'];
  state.rivalPiles.hand = ['slash', 'guard', 'hammer', 'mend', 'wall'];
  state.attacksThisTurn = 2;
  state.chain = 2;
  state.rivalIntent = 'The Duchess raises Forge Hammer…';
  state.lastPlayed = { card: 'hammer', side: 'player', at: 500 };
  state.floaters = [{ text: '-8', x: 78, y: 66, color: '#ff6a4d', born: 500, life: 1100 }];
  state.stats = { damageDealt: 19, cardsPlayed: 9, healed: 6, shieldGained: 14 };
  logLines(state, [
    'Forge Hammer hits for 8 (Chain +2).',
    'Ashen Guard: +5 shield.',
    'Turn 4 — your move.',
    'Cinder Fan hits for 2. Draw a card.',
    'The Duchess raises Forge Hammer…',
  ]);
}

// The title screen, exactly as a new player sees it.
function stageTitle(state) {
  state.screen = 'title';
}

// A won duel: EMBERLORD rank, full stat line.
function stageWin(state) {
  state.screen = 'win';
  state.phase = 'over';
  state.turn = 7;
  state.player.hp = 11;
  state.rival.hp = 0;
  state.result = { rank: 'EMBERLORD', blurb: 'A flawless court. The Duchess never stood a chance.' };
  state.stats = { damageDealt: 41, cardsPlayed: 16, healed: 6, shieldGained: 19 };
}

// A lost duel: the Knight falls on turn 9.
function stageLoss(state) {
  state.screen = 'loss';
  state.phase = 'over';
  state.turn = 9;
  state.player.hp = 0;
  state.rival.hp = 9;
  state.stats = { damageDealt: 27, cardsPlayed: 19, healed: 12, shieldGained: 22 };
}

const STAGES = { cover: stageCover, title: stageTitle, win: stageWin, loss: stageLoss };

export function stageShot(name, seed) {
  const state = base(seed);
  const stage = STAGES[name];
  if (!stage) return null;
  stage(state);
  return state;
}

export function shotNames() {
  return Object.keys(STAGES);
}
