import type { Style } from './styleSchema.js';

/*
 * WCAG 2.2 contrast for the colour pairs the components use. Mirrors buildTheme in
 * src/utils/designTokens.ts: keep the pair list and the hover tint in sync with it.
 */
export const TEXT_MIN = 4.5; // 1.4.3 text
export const UI_MIN = 3; // 1.4.11 component boundaries and states

const HEX = /^#[0-9a-f]{6}$/i;

function channels(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/* #abc -> #aabbcc; anything else unusable becomes null */
function toSixDigit(value: string) {
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  const full = short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : value;
  return HEX.test(full) ? full.toLowerCase() : null;
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a: string, b: string, amount: number) {
  const ca = channels(a);
  const cb = channels(b);
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * amount).toString(16).padStart(2, '0')).join('');
}

export type ContrastFailure = { pair: string; ratio: number; minimum: number };

/* Every pair below its WCAG AA minimum. Colours that aren't hex can't be measured and are skipped. */
export function findContrastFailures(style: Style): ContrastFailure[] {
  const c = Object.fromEntries(
    Object.entries(style.colors).map(([role, value]) => [role, toSixDigit(value)]),
  ) as Record<keyof Style['colors'], string | null>;
  // The hover and selected tint the client derives from primary
  const selected = c.primary && c.background ? mix(c.primary, c.background, 0.82) : null;

  const pairs: [string, string | null, string | null, number][] = [
    ['text on background', c.text, c.background, TEXT_MIN],
    ['text on surface', c.text, c.surface, TEXT_MIN],
    ['text on the hover tint', c.text, selected, TEXT_MIN],
    ['muted on background', c.muted, c.background, TEXT_MIN],
    ['muted on surface', c.muted, c.surface, TEXT_MIN],
    ['muted on the hover tint', c.muted, selected, TEXT_MIN],
    ['primary on background', c.primary, c.background, UI_MIN],
    ['primary on surface', c.primary, c.surface, UI_MIN],
    ['border on background', c.border, c.background, UI_MIN],
    ['border on surface', c.border, c.surface, UI_MIN],
  ];

  return pairs.flatMap(([pair, fg, bg, minimum]) => {
    if (!fg || !bg) return [];
    const ratio = contrast(fg, bg);
    return ratio < minimum ? [{ pair: `${pair} (${fg} on ${bg})`, ratio, minimum }] : [];
  });
}

/* Feedback for a second attempt, in the model's own terms */
export function describeFailures(failures: ContrastFailure[]) {
  return failures
    .map((f) => `- ${f.pair}: ${(Math.floor(f.ratio * 100) / 100).toFixed(2)}:1, needs at least ${f.minimum}:1`)
    .join('\n');
}
