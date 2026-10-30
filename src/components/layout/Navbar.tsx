import { Link } from 'react-router-dom';
import styles from './Layout.module.css';
import type { ReactNode } from "react";
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';

type NavbarProps = {
  logo: ReactNode;
};

export default function Navbar({ logo }: NavbarProps) {
    return (
        <header className={styles.siteHeader} id="top">
            <Link className={styles.wordmark} to="/" aria-label="Lilac UI home">{logo}</Link>
            <nav className={styles.nav} aria-label="Primary navigation">
                <Link className={styles.navLink}to="/">Home</Link>
                <Link className={styles.navLink} to="/components">Components</Link>
                <Link className={styles.navLink} to="/docs">Documentation</Link>
                <Link className={styles.navLink} to="/customizer">
                    Customizer <span className={styles.badge}>Beta</span>
                </Link>
                <a
                    className={styles.navLink}
                    href="https://github.com/gesk-u"
                    target="_blank"
                    rel="noreferrer"
                >
                    GItHub
                </a>
                <ThemeToggle />
            </nav>
      </header>
    )
}