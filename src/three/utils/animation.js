export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function lerpFactor(delta, speed = 8) {
  return Math.min(delta * speed, 1);
}
