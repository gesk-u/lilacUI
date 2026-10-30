import { useEffect, useId, useRef, type ReactNode } from 'react';
import styles from './Dialog.module.css';

type DialogProps = {
  open: boolean;
  /* Receives the value of the action button that closed it, or '' for Escape */
  onClose: (returnValue: string) => void;
  title: ReactNode;
  description?: ReactNode;
  /* Buttons with type="submit" and a value close the dialog with that value */
  actions: ReactNode;
};

export function Dialog({ open, onClose, title, description, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Native <dialog> traps focus, makes the page inert, and restores focus on close
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.returnValue = '';
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={(event) => onClose(event.currentTarget.returnValue)}
    >
      <h3 id={titleId} className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      <form method="dialog" className={styles.actions}>
        {actions}
      </form>
    </dialog>
  );
}
