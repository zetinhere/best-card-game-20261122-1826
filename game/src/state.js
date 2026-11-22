// Ember Court — game state, turn flow and the rival's mind.
// One job: the rules. Who has how much life, ember and shield; what a card
// does when played; when a turn ends; how the Duchess chooses her cards;
// and when the duel is won or lost. No drawing, no input, no sound here.

import {
  BASE_EMBER, CARDS, CHAIN_BONUS, EMBER_STEP_EVERY, HAND_SIZE,
  MAX_EMBER, RIVAL_ATTACK_BONUS, RIVAL_EMBER_BONUS, START_HP, rankForTurns,
} from './config.js';
import { createPiles, discardHand, drawCards, drawUpToHand, playCard } from './deck.js';
import { mulberry32 } from './random.js';

export function newGame(seed) {
  const rng = mulberry32(seed);
  const state = {
    seed,
    rng,
    screen: 'title', // title | play | win | loss
    turn: 1,
    phase: 'player', // player | rival | over
    player: { hp: START_HP, maxHp: START_HP, shield: 0, ember: BASE_EMBER, maxEmber: BASE_EMBER },
    rival: { hp: START_HP, maxHp: START_HP, shield: 0, ember: BASE_EMBER, maxEmber: BASE_EMBER },
    piles: createPiles(rng),
    rivalPiles: createPiles(rng),
    attacksThisTurn: 0,
    chain: 0, // Ember Chain: attacks after the first gain +2 damage
    log: [],
    floaters: [], // { text, x, y, color, born, life }
    rivalIntent: null, // text shown while the Duchess thinks
    rivalQueue: [], // card ids the Duchess will play, in order
    rivalTimer: 0, // ms until the next rival card
    lastPlayed: null, // { card, side, at } — shown centre-table briefly
    stats: { damageDealt: 0, cardsPlayed: 0, healed: 0, shieldGained: 0 },
    result: null, // { rank, blurb } on win
    startedAt: 0,
    now: 0,
  };
  drawCards(state.piles, HAND_SIZE, rng);
  drawCards(state.rivalPiles, HAND_SIZE, rng);
  return state;
}

export function maxEmberForTurn(turn) {
  return Math.min(MAX_EMBER, BASE_EMBER + Math.floor((turn - 1) / EMBER_STEP_EVERY));
}

function say(state, text) {
  state.log.unshift(text);
  if (state.log.length > 5) state.log.length = 5;
}

export function floatText(state, text, x, y, color) {
  state.floaters.push({ text, x, y, color, born: state.now, life: 1100 });
}

// Damage first eats shield, then life. Returns damage that reached life.
export function dealDamage(target, amount) {
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked;
    left -= blocked;
  }
  target.hp = Math.max(0, target.hp - left);
  return left;
}

// Resolve one card. `side` is 'player' or 'rival'; the other side is hit.
export function resolveCard(state, side, cardId) {
  const card = CARDS[cardId];
  const me = state[side];
  const foe = side === 'player' ? state.rival : state.player;
  me.ember -= card.cost;
  state.lastPlayed = { card: cardId, side, at: state.now };
  state.stats.cardsPlayed += side === 'player' ? 1 : 0;

  let chainNote = '';
  if (card.dmg) {
    let dmg = card.dmg;
    if (side === 'rival') {
      // Ashen Edge: the Duchess hits harder than her cards say.
      dmg += RIVAL_ATTACK_BONUS;
    }
    if (side === 'player') {
      state.attacksThisTurn += 1;
      if (state.attacksThisTurn > 1) {
        dmg += CHAIN_BONUS;
        state.chain = state.attacksThisTurn;
        chainNote = ` (Chain +${CHAIN_BONUS})`;
      }
    }
    const through = dealDamage(foe, dmg);
    if (side === 'player') state.stats.damageDealt += through;
    say(state, `${card.name} hits for ${dmg}${chainNote}.`);
    // The number pops over the target's portrait, clear of the intent
    // line, the log and the last-played card in the middle of the table.
    const target = side === 'player' ? { x: 78, y: 66 } : { x: 54, y: 548 };
    floatText(state, `-${dmg}`, target.x, target.y, '#ff6a4d');
  }
  if (card.shield) {
    me.shield += card.shield;
    if (side === 'player') state.stats.shieldGained += card.shield;
    say(state, `${card.name}: +${card.shield} shield.`);
  }
  if (card.heal) {
    const before = me.hp;
    me.hp = Math.min(me.maxHp, me.hp + card.heal);
    if (side === 'player') state.stats.healed += me.hp - before;
    say(state, `${card.name}: +${me.hp - before} life.`);
  }
  if (card.ember) {
    me.ember = Math.min(me.maxEmber + 2, me.ember + card.ember);
    say(state, `${card.name}: +${card.ember} ember.`);
  }
  if (card.draw) {
    const piles = side === 'player' ? state.piles : state.rivalPiles;
    drawCards(piles, card.draw, state.rng);
    say(state, `${card.name}: drew a card.`);
  }
}

// Can this side afford and play this card right now?
export function canPlay(state, side, cardId) {
  const card = CARDS[cardId];
  return card && state[side].ember >= card.cost;
}

// The player plays the card at hand index. Returns true when it resolved.
export function playerPlayCard(state, handIndex) {
  if (state.screen !== 'play' || state.phase !== 'player') return false;
  const cardId = state.piles.hand[handIndex];
  if (!cardId || !canPlay(state, 'player', cardId)) return false;
  playCard(state.piles, handIndex);
  resolveCard(state, 'player', cardId);
  checkEnd(state);
  return true;
}

// The Duchess picks her turn's cards: a greedy policy the player can read.
// She shows her first card as intent before she starts playing.
export function planRivalTurn(state) {
  const hand = state.rivalPiles.hand;
  const ember = state.rival.maxEmber;
  const me = state.rival;
  const foeHp = state.player.hp;
  const myHp = me.hp;
  let budget = ember;
  const queue = [];
  const playable = hand
    .map((id, i) => ({ id, i, card: CARDS[id] }))
    .filter((c) => c.card.cost <= budget);

  // Score each card for the situation; greedily take the best affordable.
  const pool = playable.slice();
  while (pool.length > 0) {
    let best = null;
    let bestScore = -1;
    for (const c of pool) {
      let score = 0;
      if (c.card.dmg) score += c.card.dmg * (foeHp <= 8 ? 3 : 1.5);
      if (c.card.shield) score += c.card.shield * (myHp <= 12 ? 2.2 : 0.8);
      if (c.card.heal) score += c.card.heal * (myHp <= 10 ? 2.5 : 0.4);
      if (c.card.ember) score += 1.2;
      if (c.card.draw) score += 1.0;
      score += state.rng() * 0.6; // a little unpredictability, still seeded
      if (score > bestScore && c.card.cost <= budget) {
        bestScore = score;
        best = c;
      }
    }
    if (!best) break;
    queue.push(best.id);
    budget -= best.card.cost;
    pool.splice(pool.indexOf(best), 1);
  }
  // Keep at most 4 cards a turn so her turn stays snappy.
  state.rivalQueue = queue.slice(0, 4);
  const first = state.rivalQueue[0];
  state.rivalIntent = first
    ? `The Duchess raises ${CARDS[first].name}…`
    : 'The Duchess holds her cards close…';
  return state.rivalQueue;
}

export function startRivalTurn(state) {
  state.phase = 'rival';
  state.rivalTimer = 700;
  planRivalTurn(state);
}

// One rival card per timer tick; when the queue empties, the player's turn.
export function updateRival(state, dt) {
  if (state.phase !== 'rival' || state.screen !== 'play') return;
  state.rivalTimer -= dt;
  if (state.rivalTimer > 0) return;
  const next = state.rivalQueue.shift();
  if (next === undefined) {
    endRivalTurn(state);
    return;
  }
  const idx = state.rivalPiles.hand.indexOf(next);
  if (idx !== -1 && canPlay(state, 'rival', next)) {
    state.rivalPiles.hand.splice(idx, 1);
    state.rivalPiles.discard.push(next);
    resolveCard(state, 'rival', next);
    if (checkEnd(state)) return;
  }
  state.rivalTimer = 750;
}

function endRivalTurn(state) {
  state.rivalIntent = null;
  state.turn += 1;
  startPlayerTurn(state);
}

function startPlayerTurn(state) {
  state.phase = 'player';
  state.attacksThisTurn = 0;
  state.chain = 0;
  state.player.shield = 0; // shield only guards through the rival's turn
  state.player.maxEmber = maxEmberForTurn(state.turn);
  state.player.ember = state.player.maxEmber;
  discardHand(state.piles); // leftover cards go; a fresh hand is drawn
  drawUpToHand(state.piles, state.rng);
  say(state, `Turn ${state.turn} — your move.`);
}

export function endPlayerTurn(state) {
  if (state.screen !== 'play' || state.phase !== 'player') return;
  state.rival.shield = 0;
  // The Duchess runs one ember hotter than the Knight.
  state.rival.maxEmber = Math.min(MAX_EMBER + RIVAL_EMBER_BONUS, maxEmberForTurn(state.turn) + RIVAL_EMBER_BONUS);
  state.rival.ember = state.rival.maxEmber;
  drawUpToHand(state.rivalPiles, state.rng);
  startRivalTurn(state);
}

export function checkEnd(state) {
  if (state.rival.hp <= 0) {
    state.screen = 'win';
    state.phase = 'over';
    state.result = rankForTurns(state.turn);
    say(state, 'The Duchess falls. The Court is yours!');
    return true;
  }
  if (state.player.hp <= 0) {
    state.screen = 'loss';
    state.phase = 'over';
    say(state, 'Your ember gutters out…');
    return true;
  }
  return false;
}
