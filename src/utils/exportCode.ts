import { themeToCss, type ComponentKey, type Theme } from './designTokens';

export const EXPORT_FORMATS = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'styled', label: 'styled-components' },
  { id: 'tokens', label: 'Lilac tokens' },
] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number]['id'];

type Part = Exclude<ComponentKey, 'all'>;

/* The resolved, contrast-checked values, with no dependency on Lilac's own CSS */
type Palette = {
  primary: string;
  onAccent: string;
  hover: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  radius: string;
  font: string;
};

function palette(theme: Theme): Palette {
  const v = theme.variables;
  return {
    primary: v['--petal-1'],
    onAccent: v['--on-accent'],
    hover: v['--accent-hover'],
    background: v['--paper'],
    surface: v['--surface'],
    text: v['--ink'],
    border: v['--rule'],
    radius: v['--radius'] ?? '0px',
    font: v['--sans'] ?? 'system-ui, sans-serif',
  };
}

const DEFAULT_LABELS: Record<Part, string> = {
  button: 'Click me',
  switch: 'Quiet mode',
  choice: 'Send reminders by',
};

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* As a JSX expression, so any label is safe inside {} */
const jsxText = (text: string) => `{${JSON.stringify(text)}}`;

/* Tailwind arbitrary values can't contain spaces */
const arbitrary = (value: string) => value.trim().replace(/\s+/g, '_');

const FOCUS_NOTE = 'The focus ring uses your text colour: check it stays visible on the page you add this to.';

/* ---------- CSS shared by vanilla and styled-components ---------- */

function buttonRules(p: Palette, self: string) {
  return `${self} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.7rem 1.1rem;
  border: 1px solid ${p.text};
  border-radius: ${p.radius};
  background: ${p.primary};
  color: ${p.onAccent};
  font: 600 1rem/1.2 ${p.font};
  cursor: pointer;
}
${self}:hover:not(:disabled) {
  background: ${p.hover};
}
${self}:focus-visible {
  outline: 3px solid ${p.text};
  outline-offset: 3px;
}
${self}:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`;
}

function switchRules(p: Palette, self: string) {
  return `${self} {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 44px;
  padding: 2px;
  border: 0;
  background: none;
  color: ${p.text};
  font: 1rem/1.4 ${p.font};
  cursor: pointer;
}
${self} .track {
  position: relative;
  flex: none;
  width: 42px;
  height: 23px;
  border: 1px solid ${p.border};
  border-radius: 999px;
  background: ${p.surface};
  transition: background 0.14s ease;
}
${self} .knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: ${p.primary};
  transition: transform 0.14s ease;
}
${self}[aria-checked="true"] .track {
  border-color: ${p.primary};
  background: ${p.primary};
}
${self}[aria-checked="true"] .knob {
  transform: translateX(19px);
  background: ${p.background};
}
${self}:focus-visible {
  outline: 3px solid ${p.text};
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  ${self} .track,
  ${self} .knob { transition: none; }
}`;
}

function choiceRules(p: Palette, self: string) {
  return `${self} {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  color: ${p.text};
  font: 1rem/1.4 ${p.font};
}
${self} legend {
  margin-bottom: 0.5rem;
  padding: 0;
  font-weight: 600;
}
${self} label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  cursor: pointer;
}
${self} input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: ${p.primary};
  cursor: pointer;
}
${self} input:focus-visible {
  outline: 3px solid ${p.text};
  outline-offset: 2px;
}`;
}

/* ---------- Vanilla HTML + CSS ---------- */

/* Markup only, with the accessibility choices spelled out: this is the part people get wrong */
function html(part: Part, _p: Palette, label: string) {
  const text = escapeHtml(label);
  switch (part) {
    case 'button':
      return `<!-- A real <button>: focusable, and Enter and Space work without any script.
     type="button" stops it submitting a surrounding form. -->
<button class="lilac-button" type="button">${text}</button>`;
    case 'switch':
      return `<!-- role="switch" + aria-checked: announced as "${text}, switch, off".
     The visible label stays the same; only aria-checked changes. -->
<button class="lilac-switch" type="button" role="switch" aria-checked="false">
  <!-- Decoration only, so screen readers skip it -->
  <span class="track" aria-hidden="true"><span class="knob"></span></span>
  <span>${text}</span>
</button>

<script>
  // Flip aria-checked on click; the button already handles Enter and Space
  document.querySelectorAll('.lilac-switch').forEach((sw) => {
    sw.addEventListener('click', () => {
      sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
    });
  });
</script>`;
    case 'choice':
      return `<!-- <fieldset> + <legend>: the question is read before each option.
     Each <label> wraps its checkbox, so the whole row is the click target. -->
<fieldset class="lilac-choice">
  <legend>${text}</legend>
  <label><input type="checkbox" name="channel" value="email" checked> Email</label>
  <label><input type="checkbox" name="channel" value="sms"> Text message</label>
</fieldset>`;
  }
}

/* The stylesheet for the HTML tab's markup */
function css(part: Part, p: Palette) {
  switch (part) {
    case 'button':
      return buttonRules(p, '.lilac-button');
    case 'switch':
      return switchRules(p, '.lilac-switch');
    case 'choice':
      return choiceRules(p, '.lilac-choice');
  }
}

/* ---------- Tailwind (v4, React) ---------- */

function tailwind(part: Part, p: Palette, label: string) {
  const font = `style={{ fontFamily: ${JSON.stringify(p.font)} }}`;
  const radius = p.radius === '999px' ? 'rounded-full' : `rounded-[${arbitrary(p.radius)}]`;
  const focus = `focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[${p.text}]`;

  switch (part) {
    case 'button':
      return `export function ThemedButton() {
  return (
    <button
      type="button"
      ${font}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center ${radius} border border-[${p.text}] bg-[${p.primary}] px-[1.1rem] py-[0.7rem] font-semibold text-[${p.onAccent}] hover:enabled:bg-[${p.hover}] ${focus} disabled:cursor-not-allowed disabled:opacity-50"
    >
      ${jsxText(label)}
    </button>
  );
}`;
    case 'switch':
      return `import { useState } from 'react';

export function ThemedSwitch() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      ${font}
      className="group inline-flex min-h-11 cursor-pointer items-center gap-2.5 p-0.5 text-[${p.text}] ${focus}"
    >
      <span
        aria-hidden="true"
        className="relative h-[23px] w-[42px] flex-none rounded-full border border-[${p.border}] bg-[${p.surface}] transition-colors group-aria-checked:border-[${p.primary}] group-aria-checked:bg-[${p.primary}] motion-reduce:transition-none"
      >
        <span className="absolute top-[2px] left-[2px] h-[17px] w-[17px] rounded-full bg-[${p.primary}] transition-transform group-aria-checked:translate-x-[19px] group-aria-checked:bg-[${p.background}] motion-reduce:transition-none" />
      </span>
      <span>${jsxText(label)}</span>
    </button>
  );
}`;
    case 'choice':
      return `export function ThemedChoice() {
  return (
    <fieldset ${font} className="m-0 min-w-0 border-0 p-0 text-[${p.text}]">
      <legend className="mb-2 p-0 font-semibold">${jsxText(label)}</legend>
      {['Email', 'Text message'].map((option, index) => (
        <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            name="channel"
            value={option}
            defaultChecked={index === 0}
            className="m-0 h-[18px] w-[18px] cursor-pointer accent-[${p.primary}] ${focus.replace(/offset-3/, 'offset-2')}"
          />
          {option}
        </label>
      ))}
    </fieldset>
  );
}`;
  }
}

/* ---------- styled-components (React) ---------- */

/* For styled-components: the first "& { ... }" block becomes the component's own
   declarations, and everything is indented to sit inside the template literal */
const forStyled = (css: string) => {
  const parts = /^& \{\n([\s\S]*?)\n\}\n([\s\S]*)$/.exec(css);
  return parts ? `${parts[1]}\n${parts[2].replace(/^(?=.)/gm, '  ')}` : css;
};

function styled(part: Part, p: Palette, label: string) {
  switch (part) {
    case 'button':
      return `import styled from 'styled-components';

export const ThemedButton = styled.button.attrs({ type: 'button' })\`
${forStyled(buttonRules(p, '&'))}
\`;

// Usage: <ThemedButton>${jsxText(label)}</ThemedButton>`;
    case 'switch':
      return `import { useState } from 'react';
import styled from 'styled-components';

const SwitchButton = styled.button\`
${forStyled(switchRules(p, '&'))}
\`;

export function ThemedSwitch() {
  const [on, setOn] = useState(false);
  return (
    <SwitchButton type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)}>
      <span className="track" aria-hidden="true"><span className="knob" /></span>
      <span>${jsxText(label)}</span>
    </SwitchButton>
  );
}`;
    case 'choice':
      return `import styled from 'styled-components';

const Fieldset = styled.fieldset\`
${forStyled(choiceRules(p, '&'))}
\`;

export function ThemedChoice() {
  return (
    <Fieldset>
      <legend>${jsxText(label)}</legend>
      <label><input type="checkbox" name="channel" value="email" defaultChecked /> Email</label>
      <label><input type="checkbox" name="channel" value="sms" /> Text message</label>
    </Fieldset>
  );
}`;
  }
}

const COMMENT: Record<Exclude<ExportFormat, 'tokens'>, (text: string) => string> = {
  html: (text) => `<!-- ${text} -->`,
  css: (text) => `/* ${text} */`,
  tailwind: (text) => `// ${text}`,
  styled: (text) => `// ${text}`,
};

// Typed explicitly: css() ignores the label, which a three-argument signature still accepts
const GENERATORS: Record<Exclude<ExportFormat, 'tokens'>, (part: Part, p: Palette, label: string) => string> = {
  html,
  css,
  tailwind,
  styled,
};

/* Ready-to-paste code for the component the user asked for (all three when none was named) */
export function exportCode(theme: Theme, format: ExportFormat) {
  if (format === 'tokens') return themeToCss(theme);

  const p = palette(theme);
  const parts: Part[] = theme.component === 'all' ? ['button', 'switch', 'choice'] : [theme.component];
  const blocks = parts.map((part) => {
    // The custom label belongs to the requested component; the others keep a sensible default
    const label = theme.component === part || (theme.component === 'all' && part === 'switch')
      ? theme.label ?? DEFAULT_LABELS[part]
      : DEFAULT_LABELS[part];
    return GENERATORS[format](part, p, label);
  });
  // Colours are exported exactly as designed, so say plainly when they fail AA
  const failing = theme.checks.filter((check) => check.ratio < check.minimum).map((check) => check.label.toLowerCase());
  // The HTML tab has no colours of its own, so its note points to where they are
  const notes =
    format === 'html'
      ? ['Styles for these classes are in the CSS tab.']
      : [...(failing.length > 0 ? [`Warning: fails WCAG 2.2 AA contrast for ${failing.join(', ')}.`] : []), FOCUS_NOTE];
  return `${notes.map(COMMENT[format]).join('\n')}\n${blocks.join('\n\n')}\n`;
}
