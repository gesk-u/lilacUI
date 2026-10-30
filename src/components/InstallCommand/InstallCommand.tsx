import { useRef, useState } from 'react';
import styles from './InstallCommand.module.css';

type InstallCommandProps = {
    command: string;
};

export function InstallCommand({ command }: InstallCommandProps) {
    const codeRef = useRef<HTMLElement>(null)
    const [status, setStatus] = useState('');

    async function copy(){
        try{
            await navigator.clipboard.writeText(command);
            setStatus('Copied to clipboard');
        } catch {
            const code = codeRef.current;
            const selection = window.getSelection();
            if (code && selection) {
                const range = document.createRange();
                range.selectNodeContents(code);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            setStatus('Couldn’t copy. The command is selected, so press Ctrl+C or ⌘C.');
        }
        
    }

    return (
        <div>
            <div className={styles.box}>
                <code ref={codeRef} className={styles.code}>
                    {command}
                </code>
                <button type="button" className={styles.copy} onClick={copy} aria-label="Copy install command">
                    Copy
                </button>
            </div>
            <p className={styles.status} role="status">
                {status}
            </p>
        </div>
    )
}