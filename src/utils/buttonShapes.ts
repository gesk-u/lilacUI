/*
 * Button shapes as plain CSS variables, read by Button.module.css. Being variables,
 * they can be copied into anyone's :root like the colour tokens.
 */
export const BUTTON_SHAPES = {
  square: {
    '--button-radius': '0',
  },
  rounded: {
    '--button-radius': '0.75rem',
  },
  pill: {
    '--button-radius': '999px',
  },
  blob: {
    '--button-radius': '42% 58% 63% 37% / 48% 41% 59% 52%',
    '--button-padding': '0.9rem 1.4rem',
  },
  /*
   * The text sits in the wide lower part: 3.5rem of top padding pushes it below the point,
   * and the side padding keeps it inside the slanted edges. A max width makes long labels
   * wrap instead of widening past the slope. The button box stays a full rectangle, so the
   * click target is larger than the triangle, never smaller.
   */
  triangle: {
    '--button-clip': 'polygon(50% 0, 100% 100%, 0 100%)',
    '--button-border-color': 'transparent',
    '--button-padding': '3.5rem 2.75rem 1rem',
    '--button-min-width': '11rem',
    '--button-max-width': '13rem',
    '--button-min-height': '6rem',
  },
} as const satisfies Record<string, Record<string, string>>;

export type ButtonShape = keyof typeof BUTTON_SHAPES;
