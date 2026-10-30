import type { CodeLanguage } from '../CodeBlock/CodeBlock';
import { CodeTabs } from '../CodeTabs/CodeTabs';
import type { Theme } from '../../utils/designTokens';
import { EXPORT_FORMATS, exportCode, type ExportFormat } from '../../utils/exportCode';
import styles from './CodeExport.module.css';

/* How each format is highlighted, and what its editor tab is called */
const FILES: Record<ExportFormat, { language: CodeLanguage; file: (name: string) => string }> = {
  html: { language: 'markup', file: () => 'index.html' },
  css: { language: 'css', file: () => 'styles.css' },
  tailwind: { language: 'jsx', file: (name) => `${name}.jsx` },
  styled: { language: 'jsx', file: (name) => `${name}.jsx` },
  tokens: { language: 'css', file: () => 'theme.css' },
};

const COMPONENT_NAMES = { button: 'ThemedButton', switch: 'ThemedSwitch', choice: 'ThemedChoice', all: 'ThemedComponents' };

/* The code is the product: shown open, one format at a time, Copy where people look for it */
export function CodeExport({ theme }: { theme: Theme }) {
  const files = EXPORT_FORMATS.map(({ id, label }) => ({
    id,
    label,
    filename: FILES[id].file(COMPONENT_NAMES[theme.component]),
    language: FILES[id].language,
    code: exportCode(theme, id),
  }));

  return (
    <section aria-labelledby="code-title" className={styles.export}>
      <h2 id="code-title" className={styles.heading}>Get the code</h2>
      <CodeTabs legend="Code format" name="code-format" files={files} />
    </section>
  );
}
