import { contrast, ensureContrast, luminance, mix, toHex } from './color';

export const COLOR_ROLES = ['primary', 'background', 'surface', 'text', 'muted', 'border'] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

/* Only stacks from this list reach the CSS, so the model can't inject arbitrary values */
export const FONT_STACKS = {
  sans: '"Figtree", system-ui, sans-serif',
  serif: '"Libre Caslon Text", Georgia, "Times New Roman", serif',
  mono: '"IBM Plex Mono", ui-monospace, Consolas, monospace',
  rounded: 'ui-rounded, "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif',
  playful: '"Comic Sans MS", "Comic Neue", "Chalkboard SE", cursive',
  spooky: '"Creepster", "Chiller", "Papyrus", fantasy',
} as const;
export type FontKey = keyof typeof FONT_STACKS;

export const COMPONENTS = ['button', 'switch', 'choice', 'all'] as const;
export type ComponentKey = (typeof COMPONENTS)[number];

export const LABEL_MAX = 40;

export type DesignTokens = {
  colors: Partial<Record<ColorRole, string>>;
  borderRadius?: string;
  font?: FontKey;
  /* Which component the request was about, shown first and large */
  component?: ComponentKey;
  /* Text for the featured component, e.g. a button label */
  label?: string;
};

/* Later layers win: e.g. the AI's style, then the user's own CSS */
export function mergeTokens(...layers: (DesignTokens | null | undefined)[]): DesignTokens {
  const merged: DesignTokens = { colors: {} };
  for (const layer of layers) {
    if (!layer) continue;
    Object.assign(merged.colors, layer.colors);
    merged.borderRadius = layer.borderRadius ?? merged.borderRadius;
    merged.font = layer.font ?? merged.font;
    merged.component = layer.component ?? merged.component;
    merged.label = layer.label ?? merged.label;
  }
  return merged;
}

/* The site's own light theme, used for any role the user leaves out */
export const LILAC_DEFAULTS: Record<ColorRole, string> = {
  primary: '#4b3478',
  background: '#f3eff8',
  surface: '#fdfbff',
  text: '#2a1d45',
  muted: '#574a70',
  border: '#8c80a3',
};

export type ContrastCheck = {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
};

/* A colour the safety net changed, and the worst pair that made it necessary */
export type Adjustment = {
  role: ColorRole;
  from: string;
  to: string;
  reason: { against: string; ratio: number; minimum: number };
};

export type Theme = {
  variables: Record<string, string>;
  component: ComponentKey;
  label?: string;
  colorScheme: 'light' | 'dark';
  checks: ContrastCheck[];
  /* Colours changed here to pass AA; empty when the design already passed */
  adjustments: Adjustment[];
  /* Roles whose given colour couldn't be read (e.g. "ffb6c1", "pinkish"), so a default stood in */
  unreadable: { role: ColorRole; value: string }[];
};

const TEXT_MIN = 4.5; // WCAG 1.4.3
const UI_MIN = 3; // WCAG 1.4.11

/* Nudge a colour toward black or white until it passes against every background in turn */
function fit(color: string, against: string[], min: number) {
  return against.reduce((current, bg) => ensureContrast(current, bg, min), color);
}

/*
 * Turns loose tokens into Lilac's CSS variables. The server already asks the AI for
 * colours that pass WCAG 2.2 AA; this is the safety net: any pair that still fails has
 * its foreground nudged just enough to pass, and every change is listed in adjustments.
 * Backgrounds are never changed, so the overall look stays the AI's.
 */
export function buildTheme(tokens: DesignTokens): Theme {
  const given: Partial<Record<ColorRole, string>> = {};
  const unreadable: Theme['unreadable'] = [];
  for (const role of COLOR_ROLES) {
    const value = tokens.colors[role];
    if (!value) continue;
    const hex = toHex(value);
    if (hex) given[role] = hex;
    else unreadable.push({ role, value });
  }
  const c = { ...LILAC_DEFAULTS, ...given };
  const { background: bg, surface } = c;

  const primary = fit(c.primary, [bg, surface], UI_MIN);
  // Derived, not given: the hover/selected tint
  const selected = mix(primary, bg, 0.82);
  const text = fit(c.text, [bg, surface, selected], TEXT_MIN);
  const muted = fit(c.muted, [bg, surface, selected], TEXT_MIN);
  const border = fit(c.border, [bg, surface], UI_MIN);

  // What each foreground must pass against, to explain any change in plain words
  const against: Partial<Record<ColorRole, [string, string, number][]>> = {
    primary: [['background', bg, UI_MIN], ['surface', surface, UI_MIN]],
    text: [['background', bg, TEXT_MIN], ['surface', surface, TEXT_MIN], ['the hover tint', selected, TEXT_MIN]],
    muted: [['background', bg, TEXT_MIN], ['surface', surface, TEXT_MIN], ['the hover tint', selected, TEXT_MIN]],
    border: [['background', bg, UI_MIN], ['surface', surface, UI_MIN]],
  };
  const final: Record<ColorRole, string> = { primary, background: bg, surface, text, muted, border };
  const adjustments: Adjustment[] = COLOR_ROLES.filter((role) => final[role] !== c[role]).map((role) => {
    // The worst pair the original colour had, relative to what it needed
    const worst = (against[role] ?? [])
      .map(([name, backdrop, minimum]) => ({ against: name, ratio: contrast(c[role], backdrop), minimum }))
      .sort((a, b) => a.ratio / a.minimum - b.ratio / b.minimum)[0];
    return { role, from: c[role], to: final[role], reason: worst };
  });

  // Button text isn't part of the style, so pick the theme colour that reads best on primary
  const candidates = [bg, text, '#ffffff', '#000000'];
  const onAccent =
    candidates.find((color) => contrast(color, primary) >= TEXT_MIN) ??
    candidates.reduce((best, color) => (contrast(color, primary) > contrast(best, primary) ? color : best));
  // Derived hover fill: the text colour, nudged only if the button text wouldn't read on it
  const accentHover = ensureContrast(text, onAccent, TEXT_MIN);

  const pairs: [string, string, string, number][] = [
    ['Text on background', text, bg, TEXT_MIN],
    ['Text on surface', text, surface, TEXT_MIN],
    ['Text on hover and selected', text, selected, TEXT_MIN],
    ['Muted text on background', muted, bg, TEXT_MIN],
    ['Muted text on surface', muted, surface, TEXT_MIN],
    ['Muted text on hover and selected', muted, selected, TEXT_MIN],
    ['Button text on primary', onAccent, primary, TEXT_MIN],
    ['Button text on hover', onAccent, accentHover, TEXT_MIN],
    ['Borders on background', border, bg, UI_MIN],
    ['Borders on surface', border, surface, UI_MIN],
    ['Primary on background', primary, bg, UI_MIN],
    ['Primary on surface', primary, surface, UI_MIN],
  ];

  const variables: Record<string, string> = {
    '--paper': bg,
    '--surface': surface,
    '--ink': text,
    '--body': text,
    '--secondary': muted,
    '--rule': border,
    '--petal-1': primary,
    '--petal-2': primary,
    '--on-accent': onAccent,
    '--accent-hover': accentHover,
    '--selected': selected,
  };
  const radius = tokens.borderRadius?.trim();
  if (radius && CSS.supports('border-radius', radius)) variables['--radius'] = radius;
  if (tokens.font && tokens.font in FONT_STACKS) variables['--sans'] = FONT_STACKS[tokens.font];
  const label = tokens.label?.trim().slice(0, LABEL_MAX);

  return {
    variables,
    component: tokens.component ?? 'all',
    label: label || undefined,
    colorScheme: luminance(bg) < 0.2 ? 'dark' : 'light',
    checks: pairs.map(([label, foreground, background, minimum]) => ({
      label,
      foreground,
      background,
      minimum,
      ratio: contrast(foreground, background),
    })),
    adjustments,
    unreadable,
  };
}

export function themeToCss(theme: Theme) {
  const lines = Object.entries(theme.variables).map(([name, value]) => `  ${name}: ${value};`);
  return `:root {\n${lines.join('\n')}\n  color-scheme: ${theme.colorScheme};\n}\n`;
}
