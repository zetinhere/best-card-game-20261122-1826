// Ember Court — deck, hand and discard.
// One job: build a shuffled deck from DECK_LIST and move cards between
// deck, hand and discard. Reshuffles the discard into the deck when empty.

import { DECK_LIST, HAND_SIZE } from './config.js';
import { shuffle } from './random.js';

export function buildDeck(rng) {
  const cards = [];
  for (const [id, count] of DECK_LIST) {
    for (let i = 0; i < count; i++) cards.push(id);
  }
  return shuffle(cards, rng);
}

export function createPiles(rng) {
  return { deck: buildDeck(rng), hand: [], discard: [] };
}

// Draw n cards into the hand; reshuffle the discard when the deck runs dry.
export function drawCards(piles, n, rng) {
  for (let i = 0; i < n; i++) {
    if (piles.deck.length === 0) {
      if (piles.discard.length === 0) return;
      piles.deck = shuffle(piles.discard, rng);
      piles.discard = [];
    }
    piles.hand.push(piles.deck.pop());
  }
}

// Draw the hand back up to HAND_SIZE at the start of a turn.
export function drawUpToHand(piles, rng) {
  const missing = HAND_SIZE - piles.hand.length;
  if (missing > 0) drawCards(piles, missing, rng);
}

// Play the card at hand index: remove it from the hand, put it in discard.
export function playCard(piles, handIndex) {
  const [id] = piles.hand.splice(handIndex, 1);
  piles.discard.push(id);
  return id;
}

export function discardHand(piles) {
  piles.discard.push(...piles.hand);
  piles.hand = [];
}
