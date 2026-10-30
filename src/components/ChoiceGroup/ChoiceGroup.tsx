import type { ReactNode } from 'react';
import styles from './ChoiceGroup.module.css';

export type ChoiceOption = {
  value: string;
  label: ReactNode;
};

type ChoiceGroupProps = {
  legend: ReactNode;
  options: ChoiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
  name?: string;
  /* Rendered inside the fieldset, after the options (e.g. a live tally) */
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  /* Documentation previews only: draw the first option's focus ring without focus */
  'data-state'?: 'focus';
};

export function ChoiceGroup({
  legend,
  options,
  value,
  onChange,
  name,
  children,
  className,
  disabled,
  'data-state': dataState,
}: ChoiceGroupProps) {
  function toggle(optionValue: string, checked: boolean) {
    onChange(checked ? [...value, optionValue] : value.filter((v) => v !== optionValue));
  }

  return (
    <fieldset className={[styles.group, className].filter(Boolean).join(' ')} disabled={disabled} data-state={dataState}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={value.includes(option.value)}
            onChange={(event) => toggle(option.value, event.target.checked)}
          />
          {option.label}
        </label>
      ))}
      {children}
    </fieldset>
  );
}
