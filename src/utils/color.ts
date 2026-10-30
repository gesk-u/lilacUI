const HEX = /^#[0-9a-f]{6}$/;
let ctx: CanvasRenderingContext2D | null | undefined;

/* Any opaque CSS colour (hex, rgb(), hsl(), names) as #rrggbb; null if invalid or translucent */
export function toHex(value: string): string | null {
  const v = value.trim();
  if (!v || !CSS.supports('color', v)) return null;
  if (ctx === undefined) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000000';
  ctx.fillStyle = v;
  const out = String(ctx.fillStyle).toLowerCase();
  return HEX.test(out) ? out : null;
}

/*
 * Like toHex, but also reads translucent colours: rgba(139, 92, 246, 0.25) -> { hex, alpha }.
 * Contrast needs an opaque colour, so callers composite it onto a background with mix().
 */
export function readColor(value: string): { hex: string; alpha: number } | null {
  const opaque = toHex(value);
  if (opaque) return { hex: opaque, alpha: 1 };
  const v = value.trim();
  if (!v || !CSS.supports('color', v) || !ctx) return null;
  ctx.fillStyle = '#000000';
  ctx.fillStyle = v;
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(String(ctx.fillStyle));
  if (!rgba) return null;
  const alpha = Number(rgba[4]);
  return alpha > 0 ? { hex: fromChannels([rgba[1], rgba[2], rgba[3]].map(Number)), alpha } : null;
}

function channels(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function fromChannels(c: number[]) {
  return '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
}

/* WCAG 2.2 relative luminance */
export function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* WCAG 2.2 contrast ratio, 1 to 21 */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* Rounded down, so a displayed 4.50 is never really 4.497 */
export function formatRatio(ratio: number) {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}

/* a blended toward b by amount (0 to 1), in sRGB */
export function mix(a: string, b: string, amount: number) {
  const ca = channels(a);
  const cb = channels(b);
  return fromChannels(ca.map((v, i) => v + (cb[i] - v) * amount));
}

/* Nudge fg toward black or white until it reaches min contrast against bg */
export function ensureContrast(fg: string, bg: string, min: number) {
  if (contrast(fg, bg) >= min) return fg;
  const darkerFirst = contrast('#000000', bg) > contrast('#ffffff', bg);
  for (const target of darkerFirst ? ['#000000', '#ffffff'] : ['#ffffff', '#000000']) {
    for (let step = 1; step <= 20; step++) {
      const candidate = mix(fg, target, step / 20);
      if (contrast(candidate, bg) >= min) return candidate;
    }
  }
  return darkerFirst ? '#000000' : '#ffffff';
}
