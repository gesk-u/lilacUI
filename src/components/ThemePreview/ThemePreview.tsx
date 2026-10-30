import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { CodeExport } from '../CodeExport/CodeExport';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Switch } from '../Switch/Switch';
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup';
import { formatRatio } from '../../utils/color';
import type { ComponentKey, ContrastCheck, Theme } from '../../utils/designTokens';
import styles from './ThemePreview.module.css';

const OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text message' },
];

/* The colour roles, in the order a designer reads a palette */
const PALETTE: [string, string][] = [
  ['Background', '--paper'],
  ['Surface', '--surface'],
  ['Text', '--ink'],
  ['Muted', '--secondary'],
  ['Primary', '--petal-1'],
  ['Border', '--rule'],
];

const BACKDROPS = [
  { value: 'theme', label: 'Your background' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;
type Backdrop = (typeof BACKDROPS)[number]['value'];
const BACKDROP_COLOR: Record<Exclude<Backdrop, 'theme'>, string> = { light: '#ffffff', dark: '#121212' };

/* How far a pair sits above (or below) what it needs; the tightest pair is the honest headline */
const margin = (check: ContrastCheck) => check.ratio / check.minimum;

function Ratio({ check }: { check: ContrastCheck }) {
  return (
    <>
      {check.label.toLowerCase()}, <strong>{formatRatio(check.ratio)}:1</strong> (needs {check.minimum}:1)
    </>
  );
}

/* A swatch for a colour that's also written out, so the swatch is never the only signal */
function Swatch({ color }: { color: string }) {
  return <span className={styles.inlineSwatch} style={{ background: color }} aria-hidden="true" />;
}

/* The real Lilac components, with the theme's variables scoped to the stage */
export function ThemePreview({ theme }: { theme: Theme }) {
  const [quiet, setQuiet] = useState(true);
  const [channels, setChannels] = useState(['email']);
  const [backdrop, setBackdrop] = useState<Backdrop>('theme');

  const failing = theme.checks.filter((check) => check.ratio < check.minimum);
  const passes = failing.length === 0;
  const tightest = [...theme.checks].sort((a, b) => margin(a) - margin(b))[0];

  const stageStyle = {
    '--radius': '0px',
    ...theme.variables,
    ...(backdrop !== 'theme' && { '--stage-bg': BACKDROP_COLOR[backdrop] }),
    colorScheme: backdrop === 'theme' ? theme.colorScheme : backdrop,
  } as CSSProperties;

  /* One place that knows how each component is shown */
  function renderComponent(component: Exclude<ComponentKey, 'all'>, label?: string, featured = false) {
    switch (component) {
      case 'button':
        // Asked for a button: show that one button, not a button row
        return featured ? (
          <Button>{label ?? 'Save changes'}</Button>
        ) : (
          <div className={styles.actions}>
            <Button>{label ?? 'Save changes'}</Button>
            <Button variant="secondary">Maybe later</Button>
          </div>
        );
      case 'switch':
        return <Switch label={label ?? 'Quiet mode'} checked={quiet} onCheckedChange={setQuiet} />;
      case 'choice':
        return (
          <ChoiceGroup legend={label ?? 'Send reminders by'} options={OPTIONS} value={channels} onChange={setChannels} />
        );
    }
  }

  /* Every state side by side. Copies, not controls: inert keeps them out of Tab order and screen readers. */
  function stateRow(component: Exclude<ComponentKey, 'all'>, label?: string): [string, ReactNode][] {
    const text = label ?? 'Label';
    const one = [OPTIONS[0]];
    const noop = () => {};
    switch (component) {
      case 'button':
        return [
          ['Default', <Button>{text}</Button>],
          ['Hover', <Button data-state="hover">{text}</Button>],
          ['Focus', <Button data-state="focus">{text}</Button>],
          ['Disabled', <Button disabled>{text}</Button>],
        ];
      case 'switch':
        return [
          ['Off', <Switch label={text} checked={false} />],
          ['On', <Switch label={text} checked />],
          ['Focus', <Switch label={text} checked={false} data-state="focus" />],
          ['Disabled', <Switch label={text} checked={false} disabled />],
        ];
      case 'choice':
        return [
          ['Unchecked', <ChoiceGroup legend={text} options={one} value={[]} onChange={noop} />],
          ['Checked', <ChoiceGroup legend={text} options={one} value={['email']} onChange={noop} />],
          ['Focus', <ChoiceGroup legend={text} options={one} value={[]} onChange={noop} data-state="focus" />],
          ['Disabled', <ChoiceGroup legend={text} options={one} value={[]} onChange={noop} disabled />],
        ];
    }
  }

  return (
    <div className={styles.result}>
      <section aria-labelledby="preview-title" className={styles.previewSection}>
        <div className={styles.headingRow}>
          <h2 id="preview-title" className={styles.heading}>Preview</h2>
          <SegmentedControl<Backdrop>
            legend="Preview background"
            name="preview-backdrop"
            options={BACKDROPS}
            value={backdrop}
            onChange={setBackdrop}
            size="small"
          />
        </div>

        <div className={styles.stageWrap} style={stageStyle}>
          <div className={[styles.stage, theme.component !== 'all' && styles.featured].filter(Boolean).join(' ')}>
            {theme.component === 'all' ? (
              <>
                <p className={styles.stageTitle}>Notification settings</p>
                <div className={styles.card}>
                  {renderComponent('switch', theme.label)}
                  {renderComponent('choice')}
                </div>
                {renderComponent('button')}
              </>
            ) : (
              renderComponent(theme.component, theme.label, true)
            )}
          </div>

          {theme.component !== 'all' && (
            <ul className={styles.states} aria-label="States">
              {stateRow(theme.component, theme.label).map(([caption, node]) => (
                <li key={caption} className={styles.state}>
                  <div inert className={styles.stateDemo}>{node}</div>
                  <span className={styles.stateCaption}>{caption}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {backdrop !== 'theme' && (
          <p className={styles.hint}>Checking on {backdrop}. The contrast figures below are for your own background.</p>
        )}

        {/* The verdict, with the actual numbers rather than a tick */}
        <div className={passes ? styles.verdictPass : styles.verdictFail}>
          <p className={styles.verdictTitle}>{passes ? '✓ Meets WCAG 2.2 AA' : `✕ ${failing.length} colour pairs fail WCAG 2.2 AA`}</p>
          <p className={styles.verdictDetail}>
            {passes ? 'Tightest pair: ' : 'Worst: '}
            <Ratio check={passes ? tightest : [...failing].sort((a, b) => margin(a) - margin(b))[0]} />.
          </p>
        </div>

        {/* If we changed someone's colour, say which, from what, and why, in the open */}
        {theme.adjustments.length > 0 && (
          <div className={styles.adjusted}>
            <p className={styles.adjustedTitle}>
              We changed {theme.adjustments.length === 1 ? 'one of your colours' : `${theme.adjustments.length} of your colours`} to pass AA
            </p>
            <ul className={styles.adjustedList}>
              {theme.adjustments.map(({ role, from, to, reason }) => (
                <li key={role}>
                  <strong>{role}</strong>: <Swatch color={from} /> <code>{from}</code> → <Swatch color={to} /> <code>{to}</code>
                  {reason && (
                    <span className={styles.reason}>
                      {' '}because it was {formatRatio(reason.ratio)}:1 on {reason.against}, and needs {reason.minimum}:1
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {theme.unreadable.length > 0 && (
          <p className={styles.problem} role="alert">
            Couldn’t read {theme.unreadable.map(({ role, value }) => `${role} (“${value}”)`).join(', ')}, so Lilac’s
            default is used there. Try again, or paste your colours as CSS.
          </p>
        )}
      </section>

      <CodeExport theme={theme} />

      {/* Reference material most people never need; opens by itself if something fails */}
      <details className={styles.more} open={!passes || undefined}>
        <summary className={styles.moreSummary}>Colours and all {theme.checks.length} contrast pairs</summary>
        <ul className={styles.palette} aria-label="Theme colours">
          {PALETTE.map(([name, variable]) => (
            <li key={variable}>
              <span className={styles.swatch} style={{ background: theme.variables[variable] }} aria-hidden="true" />
              <span className={styles.swatchName}>{name}</span>
              <code className={styles.swatchValue}>{theme.variables[variable]}</code>
            </li>
          ))}
        </ul>
        <table className={styles.table}>
          <caption className={styles.visuallyHidden}>Contrast of every colour pair</caption>
          <thead>
            <tr>
              <th scope="col">Pair</th>
              <th scope="col">Ratio</th>
              <th scope="col">Needs</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {theme.checks.map((check) => {
              const pass = check.ratio >= check.minimum;
              return (
                <tr key={check.label}>
                  <th scope="row">
                    <span className={styles.pairSwatches} aria-hidden="true">
                      <span style={{ background: check.foreground }} />
                      <span style={{ background: check.background }} />
                    </span>
                    {check.label}
                  </th>
                  <td>{formatRatio(check.ratio)}:1</td>
                  <td>{check.minimum}:1</td>
                  <td className={pass ? styles.pass : styles.fail}>{pass ? 'Pass' : 'Fail'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>
    </div>
  );
}

const LOADING_STEPS = ['Reading your request', 'Picking colours', 'Checking contrast', 'Almost there'];

/* Shown while the AI works. The page's status region announces it; this is the visual side. */
export function ThemePreviewLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, LOADING_STEPS.length - 1)), 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.result}>
      <section aria-labelledby="loading-title" className={styles.previewSection}>
        <div className={styles.headingRow}>
          <h2 id="loading-title" className={styles.heading}>Preview</h2>
        </div>
        <div className={styles.stageWrap}>
          <div className={`${styles.stage} ${styles.featured}`}>
            <div className={styles.skeleton} aria-hidden="true">
              <span className={styles.skeletonControl} />
              <span className={styles.skeletonLabel} />
            </div>
            <p className={styles.loadingText}>{LOADING_STEPS[step]}…</p>
          </div>
          <ul className={styles.states} aria-hidden="true">
            {['Default', 'Hover', 'Focus', 'Disabled'].map((caption) => (
              <li key={caption} className={styles.state}>
                <span className={`${styles.skeletonChip} ${styles.shimmer}`} />
                <span className={styles.stateCaption}>{caption}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
