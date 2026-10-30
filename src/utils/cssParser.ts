import { mix, readColor } from './color';
import { COLOR_ROLES, LILAC_DEFAULTS, type ColorRole, type DesignTokens } from './designTokens';

const VARIABLE = /(--[\w-]+)\s*:\s*([^;}]+)/g;

/* Checked in order, so "--text-muted" is muted and "--border-radius" is a radius */
const ROLE_PATTERNS: [ColorRole | 'borderRadius', RegExp][] = [
  ['borderRadius', /radius|rounded/],
  ['muted', /muted|secondary|subtle/],
  ['primary', /primary|accent|brand/],
  ['surface', /surface|card|panel|popover/],
  ['background', /background|-bg\b|^--bg\b|paper|canvas/],
  ['border', /border|rule|outline|stroke|divider/],
  ['text', /foreground|-fg\b|^--fg\b|text|ink|body/],
];

/* Variants of a role are not the role itself */
const VARIANT = /hover|active|focus|disabled|-foreground\b|--on-|-on-|contrast/;

/* Not a candidate for the main colour when nothing is named primary */
const NOT_PRIMARY = /glow|shadow|dark|light|bg|surface|text|border|radius|transition|inverse|overlay/;

export type ParseResult = {
  tokens: DesignTokens;
  /* Which variable filled each token, to show the user; guessed = picked without a clear name */
  matched: { name: string; token: string; value: string; guessed?: boolean }[];
  /* Colour roles nothing in the CSS covered, so the AI or Lilac's own colours fill them */
  defaults: ColorRole[];
  /* Variables named like a colour role whose value isn't a colour we can read */
  unreadable: { name: string; value: string }[];
  /* How many custom properties the CSS contained at all */
  total: number;
};

export function extractVariables(css: string) {
  const variables: Record<string, string> = {};
  for (const [, name, value] of css.matchAll(VARIABLE)) variables[name] = value.trim();
  return variables;
}

/* Follow var(--x) references, so "--primary: var(--violet-700)" resolves */
function resolve(value: string, variables: Record<string, string>) {
  let current = value;
  for (let depth = 0; depth < 5; depth++) {
    const ref = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(current);
    if (!ref) break;
    current = variables[ref[1]] ?? ref[2] ?? current;
  }
  return current;
}

export function parseDesignCss(css: string): ParseResult {
  const variables = extractVariables(css);
  const tokens: DesignTokens = { colors: {} };
  const matched: ParseResult['matched'] = [];
  // Translucent colours wait until the background is known, then get blended onto it
  const translucent: { role: ColorRole; name: string; hex: string; alpha: number }[] = [];
  const used = new Set<string>();
  const unreadable: ParseResult['unreadable'] = [];

  for (const [name, raw] of Object.entries(variables)) {
    const lower = name.toLowerCase();
    const value = resolve(raw, variables);
    const entry = ROLE_PATTERNS.find(([, pattern]) => pattern.test(lower));
    if (!entry) continue;
    const [token] = entry;

    if (token === 'borderRadius') {
      if (!tokens.borderRadius) {
        tokens.borderRadius = value;
        matched.push({ name, token, value });
      }
      continue;
    }
    if (VARIANT.test(lower) && token !== 'text') continue;
    if (tokens.colors[token]) continue;

    const color = readColor(value);
    if (!color) {
      unreadable.push({ name, value });
      continue;
    }
    if (color.alpha === 1) {
      tokens.colors[token] = color.hex;
      matched.push({ name, token, value: color.hex });
      used.add(name);
    } else if (!translucent.some((t) => t.role === token)) {
      translucent.push({ role: token, name, ...color });
    }
  }

  // The colour you actually see: the translucent one laid over the background
  const background = tokens.colors.background ?? LILAC_DEFAULTS.background;
  for (const { role, name, hex, alpha } of translucent) {
    if (tokens.colors[role]) continue;
    const seen = mix(background, hex, alpha);
    tokens.colors[role] = seen;
    matched.push({ name, token: role, value: seen });
    used.add(name);
  }

  // Nothing named primary/accent/brand: take the first plain colour that looks like a brand colour
  if (!tokens.colors.primary) {
    for (const [name, raw] of Object.entries(variables)) {
      const lower = name.toLowerCase();
      if (used.has(name) || VARIANT.test(lower) || NOT_PRIMARY.test(lower)) continue;
      const color = readColor(resolve(raw, variables));
      if (color?.alpha !== 1) continue;
      tokens.colors.primary = color.hex;
      matched.push({ name, token: 'primary', value: color.hex, guessed: true });
      break;
    }
  }

  const defaults = COLOR_ROLES.filter((role) => !tokens.colors[role]);
  return { tokens, matched, defaults, unreadable, total: Object.keys(variables).length };
}
