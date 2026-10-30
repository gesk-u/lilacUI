import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Switch.module.css';

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'children'> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /* Keep the label constant: it names the setting, aria-checked carries the state */
  label: ReactNode;
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onCheckedChange, label, className, onClick, ...props },
  ref,
) {
  const classes = [styles.switch, className].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={classes}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange?.(!checked);
      }}
      {...props}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      <span>{label}</span>
    </button>
  );
});
