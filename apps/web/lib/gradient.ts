/** Deterministic pastel gradient from a string, used as a thumbnail fallback. */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  }
  const a = hash;
  const b = (hash + 60) % 360;
  return `linear-gradient(135deg, hsl(${a} 70% 88%), hsl(${b} 70% 78%))`;
}
