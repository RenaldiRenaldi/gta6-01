// Held movement and one-shot actions share one browser event boundary.
export function createInput(canvas) {
  const held = new Set(); const pressed = new Set(); let fire = false; let fireOnce = false; let lookX = 0; let lookY = 0;
  addEventListener('keydown', e => { if (!e.repeat) pressed.add(e.code); held.add(e.code); if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
  addEventListener('keyup', e => held.delete(e.code)); addEventListener('blur', () => held.clear());
  canvas.addEventListener('pointerdown', e => { if (e.button === 0) { fire = true; fireOnce = true; } canvas.requestPointerLock?.(); });
  addEventListener('pointerup', e => { if (e.button === 0) fire = false; });
  addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) { lookX += e.movementX; lookY += e.movementY; } });
  return { down: code => held.has(code), take: code => { const yes = pressed.has(code); pressed.delete(code); return yes; }, get firing(){const value=fire||fireOnce;fireOnce=false;return value;}, look(){const out=[lookX,lookY];lookX=lookY=0;return out;} };
}
