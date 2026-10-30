import type { ComponentType } from 'react';
import { ButtonDemo, ChoiceDemo, DialogDemo, SwitchDemo } from './componentDemos';
import type { CodeFile } from '../components/CodeTabs/CodeTabs';
import { buildTheme, LILAC_DEFAULTS, type ComponentKey } from '../utils/designTokens';
import { exportCode } from '../utils/exportCode';

export type PropDoc = { name: string; type: string; default?: string; description: string };
export type KeyDoc = { keys: string[]; action: string };

export type ComponentDoc = {
  /* Also the URL hash: /components#button */
  id: string;
  name: string;
  summary: string;
  demo: ComponentType;
  use: string[];
  avoid: string[];
  props: PropDoc[];
  keyboard: KeyDoc[];
  accessibility: string[];
  code: CodeFile[];
  /* Set when the Customizer can restyle it */
  customizable?: boolean;
};

/* HTML and CSS in Lilac's own colours, from the same generator the Customizer uses */
function plainCode(part: Exclude<ComponentKey, 'all'>, label: string, name: string, react: string): CodeFile[] {
  const theme = buildTheme({ colors: {}, component: part, label });
  return [
    { id: 'react', label: 'React', filename: `${name}.tsx`, language: 'jsx', code: react },
    { id: 'html', label: 'HTML', filename: 'index.html', language: 'markup', code: exportCode(theme, 'html') },
    { id: 'css', label: 'CSS', filename: 'styles.css', language: 'css', code: exportCode(theme, 'css') },
  ];
}

/* ---------- Dialog code: not in the Customizer yet, so written out here ---------- */

const c = LILAC_DEFAULTS;

const DIALOG_HTML = `<!-- A native <dialog> opened with showModal(): focus moves in, Tab stays inside,
     the page behind becomes inert, and Escape closes it. No focus-trap script needed. -->
<button class="lilac-button" type="button" id="open-delete">Delete project</button>

<dialog class="lilac-dialog" aria-labelledby="delete-title">
  <h2 id="delete-title">Delete this project?</h2>
  <p>It will be removed for everyone. This can’t be undone.</p>
  <!-- method="dialog": each button closes the dialog and sets returnValue to its value -->
  <form method="dialog">
    <button class="lilac-button secondary" value="keep">Keep it</button>
    <button class="lilac-button" value="delete">Delete</button>
  </form>
</dialog>

<script>
  const dialog = document.querySelector('.lilac-dialog');
  document.getElementById('open-delete').addEventListener('click', () => {
    dialog.returnValue = '';
    dialog.showModal();
  });
  // Focus goes back to the button that opened it by itself
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'delete') {
      // delete the project here
    }
  });
</script>
`;

const DIALOG_CSS = `/* The buttons use .lilac-button from the Button section */
.lilac-dialog {
  width: calc(100% - 2rem);
  max-width: 24rem;
  padding: 1.5rem;
  border: 1px solid ${c.text};
  background: ${c.background};
  color: ${c.text};
  font: 1rem/1.5 system-ui, sans-serif;
}
.lilac-dialog::backdrop {
  background: rgb(42 29 69 / 0.5);
}
.lilac-dialog h2 {
  margin: 0 0 0.5rem;
  font-size: 1.4rem;
}
.lilac-dialog p {
  margin: 0 0 1.25rem;
  color: ${c.muted};
}
.lilac-dialog form {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
}
.lilac-button.secondary {
  background: transparent;
  color: ${c.text};
}
`;

const DIALOG_REACT = `import { useState } from 'react';
import { Button } from './components/Button/Button';
import { Dialog } from './components/Dialog/Dialog';

export function DeleteProject({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project</Button>
      <Dialog
        open={open}
        onClose={(value) => {
          setOpen(false);
          if (value === 'delete') onDelete();
        }}
        title="Delete this project?"
        description="It will be removed for everyone. This can’t be undone."
        actions={
          <>
            <Button type="submit" variant="secondary" value="keep">Keep it</Button>
            <Button type="submit" value="delete">Delete</Button>
          </>
        }
      />
    </>
  );
}
`;

/* ---------- The docs ---------- */

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    id: 'button',
    name: 'Button',
    summary: 'Starts an action: save, send, open a dialog. Three looks for three levels of importance.',
    demo: ButtonDemo,
    customizable: true,
    use: [
      'Something happens on this page: a form submits, a dialog opens, a change saves.',
      'Use one primary button per view for the main action, secondary or quiet for the rest.',
    ],
    avoid: [
      'Going to another page. Use a link, so it can open in a new tab and is announced as a link.',
      'Hiding why it’s disabled. If an action isn’t available, say why next to it.',
    ],
    props: [
      { name: 'children', type: 'ReactNode', description: 'The visible label. Start with a verb: “Save changes”, not “OK”.' },
      { name: 'variant', type: "'primary' | 'secondary' | 'quiet'", default: "'primary'", description: 'How much the button stands out.' },
      { name: 'icon', type: 'ReactNode', description: 'Shown before the label and hidden from screen readers, so the label must say it all.' },
      { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'Won’t submit a surrounding form unless you ask it to.' },
      { name: '…rest', type: 'button attributes', description: 'onClick, disabled, aria-*, and a forwarded ref, all passed to the <button>.' },
    ],
    keyboard: [
      { keys: ['Tab'], action: 'Moves focus to the button.' },
      { keys: ['Enter'], action: 'Activates it.' },
      { keys: ['Space'], action: 'Activates it.' },
    ],
    accessibility: [
      'A real <button>, so keyboard support and the “button” role come from the browser.',
      'Focus ring: 3px outline, 3px offset, in the text colour, shown only for keyboard focus.',
      'At least 44px tall, so it’s easy to hit on touch screens.',
      'In Windows High Contrast mode the fill is replaced by system colours, so the label stays readable.',
    ],
    code: plainCode(
      'button',
      'Save changes',
      'SaveBar',
      `import { Button } from './components/Button/Button';

export function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Button onClick={onSave}>Save changes</Button>
      <Button variant="secondary">Discard</Button>
    </div>
  );
}
`,
    ),
  },
  {
    id: 'switch',
    name: 'Switch',
    summary: 'Turns one setting on or off, right away. No Save button needed.',
    demo: SwitchDemo,
    customizable: true,
    use: [
      'A setting that takes effect the moment it changes, like dark mode or notifications.',
      'The label names the setting; the switch shows whether it’s on.',
    ],
    avoid: [
      'Inside a form that needs Submit to apply. Use a checkbox there.',
      'Labels that change with the state (“On” / “Off”). Screen readers already announce the state.',
    ],
    props: [
      { name: 'checked', type: 'boolean', description: 'Whether it’s on. Required: the switch is always controlled.' },
      { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Called with the new state when it’s toggled.' },
      { name: 'label', type: 'ReactNode', description: 'Names the setting. Keep it the same in both states.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Shown but can’t be changed.' },
      { name: '…rest', type: 'button attributes', description: 'Everything except role and children, plus a forwarded ref.' },
    ],
    keyboard: [
      { keys: ['Tab'], action: 'Moves focus to the switch.' },
      { keys: ['Space'], action: 'Turns it on or off.' },
      { keys: ['Enter'], action: 'Turns it on or off.' },
    ],
    accessibility: [
      'A <button> with role="switch" and aria-checked, announced as “Quiet mode, switch, off”.',
      'The track and knob are decoration (aria-hidden); the state lives in aria-checked.',
      'The whole row, label included, is one 44px click target.',
      'The knob’s slide is turned off for people who ask for reduced motion.',
    ],
    code: plainCode(
      'switch',
      'Quiet mode',
      'QuietModeSetting',
      `import { useState } from 'react';
import { Switch } from './components/Switch/Switch';

export function QuietModeSetting() {
  const [quiet, setQuiet] = useState(false);

  return <Switch label="Quiet mode" checked={quiet} onCheckedChange={setQuiet} />;
}
`,
    ),
  },
  {
    id: 'choice-group',
    name: 'Choice group',
    summary: 'A question with any number of answers, as a group of checkboxes.',
    demo: ChoiceDemo,
    customizable: true,
    use: [
      'Picking none, one or several options from a short list.',
      'The legend asks the question, so each option can be one or two words.',
    ],
    avoid: [
      'Exactly one answer. Use radio buttons, or a segmented control for two to four options.',
      'Long lists (more than about seven). Use a searchable list instead.',
    ],
    props: [
      { name: 'legend', type: 'ReactNode', description: 'The question. Read out before each option.' },
      { name: 'options', type: '{ value: string; label: ReactNode }[]', description: 'The checkboxes, in order.' },
      { name: 'value', type: 'string[]', description: 'Values of the checked options.' },
      { name: 'onChange', type: '(value: string[]) => void', description: 'Called with the new list when any box changes.' },
      { name: 'name', type: 'string', description: 'Form field name, so the values submit with a form.' },
      { name: 'children', type: 'ReactNode', description: 'Shown after the options, inside the group: a live tally or a hint.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every option at once.' },
    ],
    keyboard: [
      { keys: ['Tab'], action: 'Moves to the next checkbox.' },
      { keys: ['Shift', 'Tab'], action: 'Moves to the previous one.' },
      { keys: ['Space'], action: 'Checks or unchecks the focused box.' },
    ],
    accessibility: [
      'A <fieldset> and <legend>, so the question is announced with every option.',
      'Native checkboxes: their states and keys come from the browser.',
      'Each <label> wraps its checkbox, so the whole 44px row can be clicked.',
      'A tally passed as children can use role="status" to be read out as it changes.',
    ],
    code: plainCode(
      'choice',
      'Send reminders by',
      'ReminderChannels',
      `import { useState } from 'react';
import { ChoiceGroup } from './components/ChoiceGroup/ChoiceGroup';

const CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text message' },
];

export function ReminderChannels() {
  const [channels, setChannels] = useState(['email']);

  return (
    <ChoiceGroup
      legend="Send reminders by"
      name="channels"
      options={CHANNELS}
      value={channels}
      onChange={setChannels}
    />
  );
}
`,
    ),
  },
  {
    id: 'dialog',
    name: 'Dialog',
    summary: 'Stops everything to ask one question, usually to confirm something that can’t be undone.',
    demo: DialogDemo,
    use: [
      'Confirming a destructive action: delete, discard, leave without saving.',
      'A short task that has to be finished or cancelled before going on.',
    ],
    avoid: [
      'Messages that don’t need an answer. Show them on the page instead.',
      'Long forms or content. Give them their own page.',
    ],
    props: [
      { name: 'open', type: 'boolean', description: 'Opens it as a modal when true, closes it when false.' },
      { name: 'onClose', type: '(returnValue: string) => void', description: 'Gets the value of the button that closed it, or "" for Escape. Set open to false here.' },
      { name: 'title', type: 'ReactNode', description: 'The question. Also the dialog’s accessible name.' },
      { name: 'description', type: 'ReactNode', description: 'What will happen, in a sentence.' },
      { name: 'actions', type: 'ReactNode', description: 'Buttons with type="submit" and a value. Each one closes the dialog with that value.' },
    ],
    keyboard: [
      { keys: ['Tab'], action: 'Moves between the buttons; focus can’t leave the dialog.' },
      { keys: ['Esc'], action: 'Closes it, the same as cancelling.' },
      { keys: ['Enter'], action: 'Activates the focused button.' },
    ],
    accessibility: [
      'A native <dialog> opened with showModal(): focus moves in and is held there, with no script.',
      'Everything behind it is inert, for mouse, keyboard and screen readers alike.',
      'On close, focus returns to the button that opened it.',
      'Named by its title through aria-labelledby, so it’s announced as “Delete this project?, dialog”.',
    ],
    code: [
      { id: 'react', label: 'React', filename: 'DeleteProject.tsx', language: 'jsx', code: DIALOG_REACT },
      { id: 'html', label: 'HTML', filename: 'index.html', language: 'markup', code: DIALOG_HTML },
      { id: 'css', label: 'CSS', filename: 'styles.css', language: 'css', code: DIALOG_CSS },
    ],
  },
];
