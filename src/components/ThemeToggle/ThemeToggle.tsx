import { useEffect, useState } from 'react';
import { Switch } from '../Switch/Switch';
import styles from './ThemeToggle.module.css';

type Theme = 'light' | 'dark';

/* Must match the key read by the inline script in index.html */
const STORAGE_KEY = 'lilac-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  // Until the visitor picks a theme, keep the switch in step with the OS setting
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const follow = () => {
      if (!document.documentElement.dataset.theme) setTheme(media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);

  function choose(dark: boolean) {
    const next: Theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the theme still applies for this visit
    }
    setTheme(next);
  }

  return (
    <Switch
      className={styles.toggle}
      label="Dark mode"
      checked={theme === 'dark'}
      onCheckedChange={choose}
    />
  );
}
