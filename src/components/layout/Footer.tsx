import { Link } from 'react-router-dom';
import styles from './Layout.module.css';
import type { ReactNode } from "react";

type FooterProps = {
    logo: ReactNode;
}


export default function Footer({logo}: FooterProps){
    return(
    <footer className={styles.siteFooter}>
        <Link className={styles.wordmark} to="/" aria-label="Lilac UI home">{logo}</Link>
        <nav className={styles.nav} aria-label="Footer navigation">
            <a className={styles.navLink} href="https://github.com/gesk-u" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <p>Lilac UI is an open-source component library by gesk-u</p>
    </footer>
    )
}
