import { Link } from 'react-router-dom';
import styles from './Layout.module.css';
//TODO add logo
export default function Navbar() {
    return (
        <header className={styles.siteHeader} id="top">
            <Link className={styles.wordmark} to="/" aria-label="Lilac UI home">Lilac UI</Link>
            <nav aria-label="Primary navigation">
                <Link to="/">Home</Link>
                <Link to="/components">Components</Link>
                <Link to="/docs">Documentation</Link>
                <Link to="https://github.com/gesk-u" rel="noreferrer">GitHub</Link>
            </nav>
      </header>
    )
}