// Ember Court — tuning, palette and the card catalogue.
// One job: every number and every card definition lives here, so balance
// changes touch exactly one file.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const START_HP = 36;
export const HAND_SIZE = 5;
export const DECK_SIZE = 24;
export const BASE_EMBER = 3;
export const MAX_EMBER = 6;
export const EMBER_STEP_EVERY = 3; // +1 max ember every 3rd turn
export const CHAIN_BONUS = 2; // +damage on the 2nd+ attack of a turn
export const RIVAL_EMBER_BONUS = 1; // the Duchess runs one ember hotter
export const RIVAL_ATTACK_BONUS = 2; // Ashen Edge: her attacks hit +2 harder

export const PALETTE = {
  felt: '#1d4a38',
  feltDark: '#143626',
  feltLight: '#276047',
  gold: '#f2c14e',
  goldDark: '#b98a1e',
  ember: '#ff7a2f',
  emberDeep: '#e2481f',
  ink: '#14100c',
  parchment: '#f6ead2',
  parchmentDark: '#e8d5ae',
  red: '#d64545',
  blue: '#4aa3df',
  green: '#58b368',
  purple: '#9b7ede',
  muted: '#8a7f6a',
  white: '#fff8e7',
};

// Card types: attack | guard | ember | heal | draw | hybrid
// effect: { dmg, shield, heal, ember, draw }
export const CARDS = {
  slash:   { name: 'Cinder Slash', cost: 1, type: 'attack', dmg: 3, text: 'Deal 3 damage.', suit: 'flame', color: '#e2481f' },
  hammer:  { name: 'Forge Hammer', cost: 2, type: 'attack', dmg: 6, text: 'Deal 6 damage.', suit: 'flame', color: '#e2481f' },
  nova:    { name: 'Ember Nova',   cost: 3, type: 'attack', dmg: 8, text: 'Deal 8 damage.', suit: 'flame', color: '#c22e12' },
  guard:   { name: 'Ashen Guard',  cost: 1, type: 'guard',  shield: 5, text: 'Gain 5 shield.', suit: 'shield', color: '#4aa3df' },
  wall:    { name: 'Ember Wall',   cost: 2, type: 'guard',  shield: 9, text: 'Gain 9 shield.', suit: 'shield', color: '#2f7fb8' },
  kindle:  { name: 'Kindle',       cost: 0, type: 'ember',  ember: 2, text: 'Gain 2 ember.', suit: 'ember', color: '#ff7a2f' },
  mend:    { name: 'Mend Wounds',  cost: 2, type: 'heal',   heal: 6, text: 'Restore 6 life.', suit: 'leaf', color: '#58b368' },
  fan:     { name: 'Cinder Fan',   cost: 2, type: 'hybrid', dmg: 2, draw: 1, text: 'Deal 2. Draw a card.', suit: 'flame', color: '#e2481f' },
  riposte: { name: 'Riposte',      cost: 1, type: 'hybrid', dmg: 2, shield: 3, text: 'Deal 2. Gain 3 shield.', suit: 'shield', color: '#4aa3df' },
  spark:   { name: 'Spark Jolt',   cost: 1, type: 'hybrid', dmg: 2, draw: 1, text: 'Deal 2. Draw a card.', suit: 'flame', color: '#e2481f' },
};

// How many of each card go into a 24-card deck.
export const DECK_LIST = [
  ['slash', 5], ['hammer', 3], ['nova', 2],
  ['guard', 4], ['wall', 2], ['kindle', 3],
  ['mend', 2], ['fan', 1], ['riposte', 1], ['spark', 1],
];

export const RIVAL_NAME = 'The Ash Duchess';
export const PLAYER_NAME = 'The Ember Knight';
export const GAME_TITLE = 'EMBER COURT';
export const GAME_SUBTITLE = 'a duel of ember and ash';

// Ranks awarded on the win screen, by turns taken.
export function rankForTurns(turns) {
  if (turns <= 9) return { rank: 'EMBERLORD', blurb: 'A flawless court. The Duchess never stood a chance.' };
  if (turns <= 13) return { rank: 'COURT CHAMPION', blurb: 'A hard-fought duel, won with fire to spare.' };
  return { rank: 'SURVIVOR', blurb: 'Battered, burned — but still standing.' };
}
