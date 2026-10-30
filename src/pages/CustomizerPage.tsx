import { useMemo, useState, type ChangeEvent } from 'react';
import { Button } from '../components/Button/Button';
import { ThemePreview, ThemePreviewLoading } from '../components/ThemePreview/ThemePreview';
import { StyleApiError, requestStyle } from '../services/styleApi';
import { parseDesignCss } from '../utils/cssParser';
import { buildTheme, mergeTokens, type DesignTokens } from '../utils/designTokens';
import styles from './CustomizerPage.module.css';

/* One click makes these, no typing needed */
const EXAMPLES = ['Marshmallow toggle', 'Halloween button', 'Neon arcade checkboxes', 'Calm ocean switch'];

const CSS_EXAMPLE = `:root {
  --primary: #0f766e;
  --background: #f8fafc;
  --text: #0f172a;
  --border: #94a3b8;
  --radius: 10px;
}`;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function CustomizerPage() {
  const [request, setRequest] = useState('');
  const [css, setCss] = useState('');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [tokens, setTokens] = useState<DesignTokens | null>(null);

  const theme = useMemo(() => (tokens ? buildTheme(tokens) : null), [tokens]);
  // Parsed as you paste, so you can see what was understood before making anything
  const parsed = useMemo(() => parseDesignCss(css), [css]);
  const colours = parsed.matched.filter((m) => m.token !== 'borderRadius');
  const shapes = parsed.matched.filter((m) => m.token === 'borderRadius');

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCss(await file.text());
    setFileName(file.name);
  }

  async function makeIt(text = request) {
    if (busy) return;
    setError('');
    const prompt = text.trim();
    if (!prompt && parsed.matched.length === 0) {
      setError(
        css.trim()
          ? 'None of your CSS could be read. Check it has lines like --primary: #0f766e; or describe what you want instead.'
          : 'Type what you want first, or tap an example.',
      );
      return;
    }

    function show(suggested: DesignTokens | null, message: string) {
      // The AI's style as it came back; your own CSS, if any, goes on top
      setTokens(mergeTokens(suggested, parsed.tokens));
      setStatus(message);
    }

    // CSS alone needs no AI
    if (!prompt) {
      show(null, `Made from ${plural(parsed.matched.length, 'value')} in your CSS.`);
      return;
    }

    setBusy(true);
    setStatus('Making it…');
    try {
      show(await requestStyle(prompt), 'Done. The code is ready to copy.');
    } catch (cause) {
      setStatus('');
      setError(`${cause instanceof StyleApiError ? cause.message : 'Something went wrong.'} Try again in a moment.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Customizer <span className={styles.badge}>Beta</span>
        </h1>
        <p className={styles.intro}>Describe a component. Get accessible code.</p>
      </header>

      <div className={styles.split}>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            makeIt();
          }}
        >
          {/* The label doubles as the section heading, styled like Preview and Get the code */}
          <div className={styles.field}>
            <label htmlFor="request-input" className={styles.sectionLabel}>What should we make?</label>
            <div className={styles.inputRow}>
              <input
                id="request-input"
                className={styles.input}
                type="text"
                maxLength={300}
                autoComplete="off"
                placeholder="e.g. a soft marshmallow toggle"
                value={request}
                onChange={(event) => setRequest(event.target.value)}
              />
              {/* aria-disabled, not disabled: disabling the focused button would drop keyboard focus */}
              <Button type="submit" aria-disabled={busy}>
                {busy && <span className={styles.spinner} aria-hidden="true" />}
                {busy ? 'Making…' : 'Make it'}
              </Button>
            </div>
          </div>

          <fieldset className={styles.examples}>
            <legend className={styles.hint}>Or tap one:</legend>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className={styles.example}
                aria-disabled={busy}
                onClick={() => {
                  setRequest(example);
                  makeIt(example);
                }}
              >
                {example}
              </button>
            ))}
          </fieldset>

          <p className={styles.fineprint}>
            Requests go to an AI on our server and may be saved. Your CSS stays in your browser.
          </p>

          <details className={styles.more}>
            <summary className={styles.summary}>Use my own colours (CSS)</summary>
            <div className={styles.field}>
              <label htmlFor="css-input" className={styles.label}>CSS variables</label>
              <p id="css-hint" className={styles.hint}>Paste your whole :root block. Your values win over the AI.</p>
              <textarea
                id="css-input"
                className={styles.textarea}
                aria-describedby="css-hint css-result"
                rows={12}
                spellCheck={false}
                placeholder={CSS_EXAMPLE}
                value={css}
                onChange={(event) => setCss(event.target.value)}
              />
              {/* What was understood, right under the box it describes */}
              <p id="css-result" className={styles.hint}>
                {!css.trim()
                  ? 'Nothing pasted yet.'
                  : parsed.matched.length === 0
                    ? `Found ${plural(parsed.total, 'variable')}, but none named like a colour or radius we use.`
                    : `${plural(parsed.matched.length, 'variable')} read: ${plural(colours.length, 'colour')}, ${plural(shapes.length, 'shape value')}.`}
              </p>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Or upload a file</span>
              <label className={styles.fileButton}>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept=".css,text/css"
                  aria-describedby="css-file-hint"
                  onChange={uploadFile}
                />
                Choose a .css file
              </label>
              <p id="css-file-hint" className={styles.hint}>
                {fileName ? `Loaded ${fileName}` : 'Accepts .css files.'}
              </p>
            </div>

            {parsed.unreadable.length > 0 && (
              <p className={styles.warning}>
                Couldn’t read {parsed.unreadable.map(({ name, value }) => `${name} (“${value}”)`).join(', ')}. Use a
                colour like #0f766e or rgb(15 118 110).
              </p>
            )}

            {colours.length > 0 && (
              <div className={styles.readGroup}>
                <p className={styles.label}>Colours</p>
                <ul className={styles.readList}>
                  {colours.map(({ name, token, value, guessed }) => (
                    <li key={name}>
                      <span className={styles.swatch} style={{ background: value }} aria-hidden="true" />
                      <span className={styles.readRole}>{token}</span>
                      <code>{value}</code>
                      <span className={styles.readSource}>
                        from {name}
                        {guessed && ' (guessed)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shapes.length > 0 && (
              <div className={styles.readGroup}>
                <p className={styles.label}>Shape</p>
                <ul className={styles.readList}>
                  {shapes.map(({ name, value }) => (
                    <li key={name}>
                      <span className={styles.radiusSample} style={{ borderRadius: value }} aria-hidden="true" />
                      <span className={styles.readRole}>corner radius</span>
                      <code>{value}</code>
                      <span className={styles.readSource}>from {name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {css.trim() && parsed.matched.length > 0 && parsed.defaults.length > 0 && (
              <p className={styles.hint}>
                Not in your CSS: {parsed.defaults.join(', ')}. The AI picks these, or Lilac’s own colours if you
                don’t describe anything.
              </p>
            )}
          </details>
        </form>

        <div className={styles.output} aria-busy={busy}>
          {/* Status and errors sit next to the result they describe */}
          <p className={styles.status} role="status">{status}</p>
          {error && <p className={styles.error} role="alert">{error}</p>}

          {busy ? (
            <ThemePreviewLoading />
          ) : theme ? (
            <ThemePreview theme={theme} />
          ) : (
            !error && <p className={styles.empty}>Your component shows up here, ready to copy.</p>
          )}
        </div>
      </div>
    </div>
  );
}
