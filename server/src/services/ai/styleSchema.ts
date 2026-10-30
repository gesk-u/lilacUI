import { z } from 'zod';

/*
 * The style the AI must return. Keep these lists in sync with the client:
 * src/utils/designTokens.ts (COLOR_ROLES, FONT_STACKS, COMPONENTS, LABEL_MAX).
 * The client still re-checks every colour and fixes contrast, so this only guards shape.
 */
export const COMPONENTS = ['button', 'switch', 'choice', 'all'] as const;
export const FONTS = ['sans', 'serif', 'mono', 'rounded', 'playful', 'spooky'] as const;
export const LABEL_MAX = 40;

const color = z.string().max(32);

export const styleSchema = z.object({
  component: z.enum(COMPONENTS),
  label: z.string().max(80),
  font: z.enum(FONTS),
  colors: z.object({
    primary: color,
    background: color,
    surface: color,
    text: color,
    muted: color,
    border: color,
  }),
  borderRadius: z.string().max(16),
});

export type Style = z.infer<typeof styleSchema>;

/* Ollama constrains its output to this, so a valid shape is guaranteed rather than hoped for */
export const styleJsonSchema = z.toJSONSchema(styleSchema);

/* Models sometimes drop the "#" ("ffb7c5"); without it the client can't read the colour at all */
function normalizeColor(value: string) {
  const trimmed = value.trim();
  return /^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmed) ? `#${trimmed}` : trimmed;
}

/* Validate untrusted AI output, then tidy what the schema allows but the UI can't use */
export function parseStyle(raw: unknown): Style {
  const style = styleSchema.parse(raw);
  const colors = Object.fromEntries(
    Object.entries(style.colors).map(([role, value]) => [role, normalizeColor(value)]),
  ) as Style['colors'];
  return { ...style, colors, label: style.label.trim().slice(0, LABEL_MAX) };
}
