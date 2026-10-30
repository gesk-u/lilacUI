import styles from './SegmentedControl.module.css';

type SegmentedControlProps<T extends string> = {
  /* Names the group for screen readers; hidden visually because the segments speak for themselves */
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'small' | 'medium';
};

/*
 * One choice from a few, shown as a connected strip. Built from native radios, so arrow
 * keys, a single tab stop and "2 of 3" announcements all come from the browser.
 */
export function SegmentedControl<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  size = 'medium',
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={`${styles.group} ${size === 'small' ? styles.small : ''}`}>
      <legend className={styles.visuallyHidden}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.segment}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
