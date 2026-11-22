// Ember Court — mouse and keyboard.
// One job: turn DOM events into a small queue the main loop reads once a
// frame. The loop owns the meaning of a click or a key; this file only
// records that one happened, and where.

export function createInput(canvas) {
  const input = {
    mouse: { x: -1, y: -1 },
    click: null, // { x, y } consumed by the loop
    key: null, // last key pressed, consumed by the loop
  };

  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    input.mouse = toGame(e);
  });
  canvas.addEventListener('mouseleave', () => {
    input.mouse = { x: -1, y: -1 };
  });
  canvas.addEventListener('click', (e) => {
    input.click = toGame(e);
  });
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    input.key = e.key;
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
  });

  return input;
}

export function pointInRect(p, r) {
  return p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
