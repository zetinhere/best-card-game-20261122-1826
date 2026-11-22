// Ember Court — everything the player sees.
// One job: draw the table, the portraits, the hands, the HUD and the
// title / win / loss screens on one canvas. No rules live here; it reads
// the state and the layout helpers, and nothing else.

import { CARDS, GAME_SUBTITLE, GAME_TITLE, PALETTE, PLAYER_NAME, RIVAL_NAME, VIEW_H, VIEW_W } from './config.js';

export const CARD_W = 150;
export const CARD_H = 210;
export const CARD_GAP = 14;

export function handRects(state) {
  const n = state.piles.hand.length;
  const total = n * CARD_W + (n - 1) * CARD_GAP;
  const startX = (VIEW_W - total) / 2;
  const y = 478;
  return state.piles.hand.map((id, i) => ({
    id,
    index: i,
    x: startX + i * (CARD_W + CARD_GAP),
    y,
    w: CARD_W,
    h: CARD_H,
  }));
}

export function endTurnRect() {
  return { x: VIEW_W - 196, y: 600, w: 164, h: 52 };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function suitGlyph(ctx, suit, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (suit === 'flame') {
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.9, cy - size * 0.2, cx + size * 0.7, cy + size * 0.8, cx, cy + size);
    ctx.bezierCurveTo(cx - size * 0.7, cy + size * 0.8, cx - size * 0.9, cy - size * 0.2, cx, cy - size);
  } else if (suit === 'shield') {
    ctx.moveTo(cx, cy - size);
    ctx.lineTo(cx + size * 0.85, cy - size * 0.55);
    ctx.lineTo(cx + size * 0.7, cy + size * 0.45);
    ctx.quadraticCurveTo(cx + size * 0.4, cy + size * 0.95, cx, cy + size);
    ctx.quadraticCurveTo(cx - size * 0.4, cy + size * 0.95, cx - size * 0.7, cy + size * 0.45);
    ctx.lineTo(cx - size * 0.85, cy - size * 0.55);
  } else if (suit === 'leaf') {
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx + size, cy - size * 0.4, cx + size * 0.55, cy + size * 0.6);
    ctx.quadraticCurveTo(cx, cy + size, cx - size * 0.55, cy + size * 0.6);
    ctx.quadraticCurveTo(cx - size, cy - size * 0.4, cx, cy - size);
  } else {
    // ember: a four-point star
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx + size * 0.25, cy - size * 0.25, cx + size, cy);
    ctx.quadraticCurveTo(cx + size * 0.25, cy + size * 0.25, cx, cy + size);
    ctx.quadraticCurveTo(cx - size * 0.25, cy + size * 0.25, cx - size, cy);
    ctx.quadraticCurveTo(cx - size * 0.25, cy - size * 0.25, cx, cy - size);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCardFace(ctx, id, x, y, w, h, opts = {}) {
  const card = CARDS[id];
  const scale = w / CARD_W;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  rr(ctx, 0, 0, CARD_W, CARD_H, 12);
  ctx.fillStyle = PALETTE.parchment;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = opts.dimmed ? '#9a8c74' : card.color;
  ctx.stroke();
  if (opts.dimmed) {
    ctx.fillStyle = 'rgba(20,16,12,0.35)';
    rr(ctx, 0, 0, CARD_W, CARD_H, 12);
    ctx.fill();
  }
  // Top colour band with the suit glyph.
  ctx.fillStyle = card.color;
  rr(ctx, 6, 6, CARD_W - 12, 44, 8);
  ctx.fill();
  suitGlyph(ctx, card.suit, 26, 28, 13, PALETTE.white);
  // Cost gem.
  ctx.beginPath();
  ctx.arc(CARD_W - 28, 28, 17, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.ember;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.white;
  ctx.stroke();
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(card.cost), CARD_W - 28, 29);
  // Name.
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(card.name, CARD_W / 2, 68);
  // Big value: the number that matters.
  const big = card.dmg ? String(card.dmg) : card.shield ? `+${card.shield}` : card.heal ? `+${card.heal}` : card.ember ? `+${card.ember}` : '';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillStyle = card.color;
  ctx.fillText(big, CARD_W / 2, 128);
  const label = card.dmg ? 'DAMAGE' : card.shield ? 'SHIELD' : card.heal ? 'HEAL' : card.ember ? 'EMBER' : '';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(label, CARD_W / 2, 158);
  // Rules text.
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#3a3128';
  ctx.fillText(card.text, CARD_W / 2, 184);
  ctx.restore();
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  rr(ctx, x, y, w, h, 8);
  ctx.fillStyle = '#5a1f16';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.gold;
  ctx.stroke();
  rr(ctx, x + 6, y + 6, w - 12, h - 12, 5);
  ctx.strokeStyle = 'rgba(242,193,78,0.6)';
  ctx.stroke();
  suitGlyph(ctx, 'flame', x + w / 2, y + h / 2, Math.min(w, h) * 0.22, PALETTE.gold);
  ctx.restore();
}

function drawPortrait(ctx, x, y, r, kind) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'rival' ? '#3a1c2e' : '#233d2a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PALETTE.gold;
  ctx.stroke();
  ctx.clip();
  // Stylised face: hood and eyes only, no borrowed art.
  ctx.fillStyle = kind === 'rival' ? '#6e2a4a' : '#c96a2e';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.15, r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6ead2';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.arc(x + r * 0.22, y - r * 0.1, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = kind === 'rival' ? '#ff5a3c' : '#ffd27a';
  ctx.beginPath();
  ctx.arc(x - r * 0.22, y - r * 0.1, r * 0.045, 0, Math.PI * 2);
  ctx.arc(x + r * 0.22, y - r * 0.1, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// A name label for a portrait row, drawn above its HP bar so nothing
// overlaps: the bar sits below the name, the ember pips below the bar.
function drawName(ctx, x, y, name) {
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(name, x, y);
}

function drawHpBar(ctx, x, y, w, hp, maxHp, shield) {
  rr(ctx, x, y, w, 22, 11);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();
  const frac = Math.max(0, hp / maxHp);
  if (frac > 0) {
    rr(ctx, x + 2, y + 2, (w - 4) * frac, 18, 9);
    ctx.fillStyle = hp <= 8 ? PALETTE.red : PALETTE.green;
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${hp} / ${maxHp}`, x + w / 2, y + 12);
  if (shield > 0) {
    ctx.textAlign = 'left';
    suitGlyph(ctx, 'shield', x + w + 16, y + 11, 9, PALETTE.blue);
    ctx.fillStyle = PALETTE.blue;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`+${shield}`, x + w + 30, y + 12);
  }
}

function drawEmberPips(ctx, x, y, ember, maxEmber) {
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ember', x, y);
  for (let i = 0; i < maxEmber; i++) {
    ctx.beginPath();
    ctx.arc(x + 62 + i * 24, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < ember ? PALETTE.ember : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = PALETTE.gold;
    ctx.stroke();
  }
}

function drawTable(ctx) {
  const g = ctx.createRadialGradient(640, 330, 80, 640, 360, 760);
  g.addColorStop(0, PALETTE.feltLight);
  g.addColorStop(0.6, PALETTE.felt);
  g.addColorStop(1, PALETTE.feltDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Gold inner border.
  ctx.strokeStyle = 'rgba(242,193,78,0.55)';
  ctx.lineWidth = 3;
  rr(ctx, 10, 10, VIEW_W - 20, VIEW_H - 20, 18);
  ctx.stroke();
  // Faint table pattern.
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 40; x < VIEW_W; x += 72) {
    for (let y = 40; y < VIEW_H; y += 72) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Centre emblem: a quiet ember court sigil.
  ctx.save();
  ctx.globalAlpha = 0.16;
  suitGlyph(ctx, 'flame', 640, 330, 74, PALETTE.gold);
  ctx.restore();
}

function drawRivalHand(ctx, state) {
  const n = state.rivalPiles.hand.length;
  const w = 84;
  const h = 118;
  const total = n * w + (n - 1) * 8 - (n - 1) * 34; // overlap the backs
  let x = 640 - total / 2;
  const y = 22;
  for (let i = 0; i < n; i++) {
    drawCardBack(ctx, x, y, w, h);
    x += w - 34 + 8;
  }
}

function drawLastPlayed(ctx, state) {
  const lp = state.lastPlayed;
  if (!lp) return;
  const age = state.now - lp.at;
  if (age > 1600) return;
  ctx.save();
  ctx.globalAlpha = age > 1200 ? 1 - (age - 1200) / 400 : 1;
  const label = lp.side === 'player' ? 'You played' : `${RIVAL_NAME} played`;
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 640, 218);
  drawCardFace(ctx, lp.card, 640 - 60, 232, 120, 168, {});
  ctx.restore();
}

function drawLog(ctx, state) {
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '13px system-ui, sans-serif';
  state.log.forEach((line, i) => {
    ctx.fillStyle = `rgba(255,248,231,${0.85 - i * 0.16})`;
    ctx.fillText(line, 28, 250 + i * 20);
  });
}

function drawFloaters(ctx, state) {
  ctx.textAlign = 'center';
  for (const f of state.floaters) {
    const age = state.now - f.born;
    if (age < 0 || age > f.life) continue;
    const k = age / f.life;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(10,6,4,0.85)';
    ctx.strokeText(f.text, f.x, f.y - k * 46);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y - k * 46);
    ctx.restore();
  }
}

function drawPlayScreen(ctx, state, mouse) {
  drawTable(ctx);
  // Rival row.
  drawPortrait(ctx, 78, 66, 44, 'rival');
  drawName(ctx, 140, 34, RIVAL_NAME);
  drawHpBar(ctx, 140, 44, 260, state.rival.hp, state.rival.maxHp, state.rival.shield);
  drawEmberPips(ctx, 140, 86, state.rival.ember, state.rival.maxEmber);
  drawRivalHand(ctx, state);
  if (state.rivalIntent) {
    ctx.fillStyle = '#ffd27a';
    ctx.font = 'italic 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.rivalIntent, 640, 168);
  }
  // Turn + deck info, top corners.
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`TURN ${state.turn}`, VIEW_W - 28, 34);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,248,231,0.75)';
  ctx.fillText(`Deck ${state.piles.deck.length} · Discard ${state.piles.discard.length}`, VIEW_W - 28, 56);

  drawLastPlayed(ctx, state);
  drawLog(ctx, state);
  if (state.chain >= 2) {
    ctx.fillStyle = PALETTE.ember;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`EMBER CHAIN ×${state.chain} — attacks +${2} damage`, 640, 452);
  }

  // Player row: a compact stack in the left margin, clear of the hand
  // (the five-card hand starts at x=237, so everything stays left of it).
  drawPortrait(ctx, 54, 548, 30, 'player');
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(PLAYER_NAME, 96, 534);
  drawHpBar(ctx, 96, 544, 126, state.player.hp, state.player.maxHp, 0);
  if (state.player.shield > 0) {
    suitGlyph(ctx, 'shield', 104, 574, 8, PALETTE.blue);
    ctx.fillStyle = PALETTE.blue;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Shield +${state.player.shield}`, 118, 575);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ember', 96, 598);
  for (let i = 0; i < state.player.maxEmber; i++) {
    ctx.beginPath();
    ctx.arc(140 + i * 15, 598, 7, 0, Math.PI * 2);
    ctx.fillStyle = i < state.player.ember ? PALETTE.ember : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = PALETTE.gold;
    ctx.stroke();
  }
  ctx.textBaseline = 'alphabetic';

  // End Turn button.
  const btn = endTurnRect();
  const hoveringBtn = mouse && mouse.x >= btn.x && mouse.x <= btn.x + btn.w && mouse.y >= btn.y && mouse.y <= btn.y + btn.h;
  rr(ctx, btn.x, btn.y, btn.w, btn.h, 10);
  ctx.fillStyle = state.phase === 'player' ? (hoveringBtn ? PALETTE.gold : PALETTE.goldDark) : '#6b5f4a';
  ctx.fill();
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.phase === 'player' ? 'END TURN' : 'DUCHESS…', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  ctx.textBaseline = 'alphabetic';

  // Player hand.
  for (const rect of handRects(state)) {
    const hovering = mouse && mouse.x >= rect.x && mouse.x <= rect.x + rect.w && mouse.y >= rect.y && mouse.y <= rect.y + rect.h;
    const affordable = state.player.ember >= CARDS[rect.id].cost;
    const lift = hovering && state.phase === 'player' ? 18 : 0;
    drawCardFace(ctx, rect.id, rect.x, rect.y - lift, rect.w, rect.h, {
      dimmed: !affordable || state.phase !== 'player',
    });
    if (hovering && state.phase === 'player') {
      ctx.fillStyle = 'rgba(255,248,231,0.9)';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[${rect.index + 1}]`, rect.x + rect.w / 2, rect.y - lift - 8);
    }
  }
  // Keyboard hints.
  ctx.fillStyle = 'rgba(255,248,231,0.6)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Keys 1–5 play a card · Enter ends turn', 28, 706);

  drawFloaters(ctx, state);
}

function drawTitleScreen(ctx, state) {
  drawTable(ctx);
  ctx.fillStyle = 'rgba(10,8,6,0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Decorative fan of sample cards.
  const samples = ['nova', 'wall', 'kindle'];
  samples.forEach((id, i) => {
    ctx.save();
    ctx.translate(640 + (i - 1) * 168, 278);
    ctx.rotate((i - 1) * 0.09);
    drawCardFace(ctx, id, -60, -84, 120, 168, {});
    ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText(GAME_TITLE, 640, 130);
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText(GAME_SUBTITLE, 640, 164);
  ctx.fillStyle = 'rgba(255,248,231,0.85)';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('Outplay the Ash Duchess in a duel of ember and ash.', 640, 470);
  ctx.fillText('Play attack cards to wear her down — chain two attacks in one turn for +2 damage.', 640, 496);
  ctx.fillText('Guard to block, Kindle for ember, Mend to heal. Reduce her 36 life to 0 before she does the same to you.', 640, 522);
  ctx.fillText('Beware her Ashen Edge: the Duchess hits +2 harder than her cards say.', 640, 548);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px system-ui, sans-serif';
  const pulse = 0.65 + 0.35 * Math.sin(state.now / 450);
  ctx.globalAlpha = pulse;
  ctx.fillText('CLICK OR PRESS ENTER TO BEGIN', 640, 580);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,248,231,0.6)';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Mouse or keys 1–5 to play · Enter to end turn · R to restart', 640, 640);
}

function drawEndScreen(ctx, state, won) {
  drawTable(ctx);
  ctx.fillStyle = won ? 'rgba(20,16,6,0.62)' : 'rgba(12,4,4,0.68)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const cx = 640;
  rr(ctx, cx - 330, 130, 660, 430, 18);
  ctx.fillStyle = won ? '#2c2113' : '#241014';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = won ? PALETTE.gold : PALETTE.red;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? PALETTE.gold : '#ff7a6a';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText(won ? 'VICTORY' : 'DEFEAT', cx, 218);
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'italic 20px Georgia, serif';
  if (won && state.result) {
    ctx.fillText(state.result.rank, cx, 258);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,248,231,0.85)';
    ctx.fillText(state.result.blurb, cx, 288);
  } else {
    ctx.fillText('Your ember gutters out. The Duchess keeps the Court.', cx, 258);
  }
  ctx.fillStyle = PALETTE.white;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('THE DUEL', cx, 330);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,248,231,0.9)';
  ctx.fillText(`Turns played: ${state.turn}`, cx, 360);
  ctx.fillText(`Damage dealt: ${state.stats.damageDealt}`, cx, 386);
  ctx.fillText(`Cards played: ${state.stats.cardsPlayed}`, cx, 412);
  ctx.fillText(`Life healed: ${state.stats.healed} · Shield raised: ${state.stats.shieldGained}`, cx, 438);
  ctx.fillStyle = won ? PALETTE.gold : 'rgba(255,248,231,0.8)';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('PRESS R OR CLICK TO PLAY AGAIN', cx, 500);
}

export function render(ctx, state, mouse) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  if (state.screen === 'title') drawTitleScreen(ctx, state);
  else if (state.screen === 'win') drawEndScreen(ctx, state, true);
  else if (state.screen === 'loss') drawEndScreen(ctx, state, false);
  else drawPlayScreen(ctx, state, mouse);
}
