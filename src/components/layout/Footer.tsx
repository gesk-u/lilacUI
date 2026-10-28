import { Link } from 'react-router-dom';
import styles from './Layout.module.css';

//TODO add logo
export default function Footer(){
    return(
    <footer className={styles.siteFooter}>
        <Link className={styles.wordmark} to="/">Lilac UI</Link>
        <div><Link to="https://github.com/gesk-u" rel="noreferrer">GitHub</Link><Link to="/docs">Docs</Link></div>
        <p>Lilac UI is an open-source component library by gesk-u</p>
    </footer>
    )
}