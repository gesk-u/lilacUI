import { useEffect, useState } from 'react';
import { CodeBlock, CodeBlockButton, type CodeLanguage } from '../CodeBlock/CodeBlock';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import styles from './CodeTabs.module.css';

export type CodeFile<T extends string = string> = {
  id: T;
  /* Shown on the segment and in the Copy button's accessible name */
  label: string;
  filename: string;
  language: CodeLanguage;
  code: string;
};

type CodeTabsProps<T extends string> = {
  /* Names the format switcher for screen readers */
  legend: string;
  /* Unique per page: the radios in each switcher need their own group */
  name: string;
  files: CodeFile<T>[];
};

/* One format at a time, Copy where people look for it, and the result announced */
export function CodeTabs<T extends string>({ legend, name, files }: CodeTabsProps<T>) {
  const [current, setCurrent] = useState<T>(files[0].id);
  const [copyStatus, setCopyStatus] = useState('');
  const file = files.find((f) => f.id === current) ?? files[0];

  // "Copied" reverts to "Copy" after a moment, so the button is ready for the next format
  useEffect(() => {
    if (!copyStatus) return;
    const timer = setTimeout(() => setCopyStatus(''), 2500);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopyStatus(`Copied ${file.filename}`);
    } catch {
      setCopyStatus('Couldn’t copy. Select the code and copy it by hand.');
    }
  }

  return (
    <div className={styles.tabs}>
      {files.length > 1 && (
        <SegmentedControl<T>
          legend={legend}
          name={name}
          options={files.map(({ id, label }) => ({ value: id, label }))}
          value={file.id}
          onChange={(next) => {
            setCurrent(next);
            setCopyStatus('');
          }}
        />
      )}

      <CodeBlock
        code={file.code}
        language={file.language}
        filename={file.filename}
        actions={
          <CodeBlockButton onClick={copy} aria-label={`Copy ${file.label} code`}>
            {copyStatus.startsWith('Copied') ? 'Copied ✓' : 'Copy'}
          </CodeBlockButton>
        }
      />
      {/* The button itself changes to "Copied"; this tells screen readers */}
      <p className={styles.visuallyHidden} role="status">{copyStatus}</p>
    </div>
  );
}
