import { useMemo, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import styles from './CodeBlock.module.css';

/* markup covers HTML with inline <style> and <script>; Prism's core ships it with css and javascript */
export type CodeLanguage = 'markup' | 'jsx' | 'css';

type CodeBlockProps = {
  code: string;
  language: CodeLanguage;
  /* Shown in the editor tab, like a file name */
  filename: string;
  /* Top-right of the tab bar, e.g. a Copy button */
  actions?: ReactNode;
};

/* Read-only code with VS Code Dark+ colours, a file tab and line numbers */
export function CodeBlock({ code, language, filename, actions }: CodeBlockProps) {
  // Prism escapes the source while tokenising, so the result is safe to insert as HTML
  const html = useMemo(() => Prism.highlight(code, Prism.languages[language], language), [code, language]);
  const lineCount = code.replace(/\n$/, '').split('\n').length;

  return (
    <div className={styles.editor}>
      <div className={styles.tabs}>
        <span className={styles.tab}>{filename}</span>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {/* Focusable, so keyboard users can scroll long code */}
      <div className={styles.body} tabIndex={0} role="region" aria-label={`Code: ${filename}`}>
        <pre className={styles.gutter} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
        </pre>
        <pre className={styles.code}>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}

/* A button styled for the editor's dark tab bar */
export function CodeBlockButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={styles.tabButton} />;
}
