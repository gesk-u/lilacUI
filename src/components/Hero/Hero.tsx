import { InstallCommand } from '../InstallCommand/InstallCommand';
//import { LilacSpecimen } from '../LilacSpecimen/LilacSpecimen';
import styles from './Hero.module.css';
import { LilacSpecimen } from '../LilacSpecimen/LilacSpecimen';

export function Hero() {
  return (
    <section className={styles.hero} id="field-guide" aria-labelledby="page-title">
      <h1 id="page-title" className={styles.title}>
        <span className={styles.titleLine1}>Accessible components,</span>
        <span className={styles.titleLine2}>styled your way</span>
     </h1>

      <div className={styles.heroIntro}>
        <p className={styles.lede}>
          Lilac UI is a small library of accessible web components. Each one is built on
          native HTML and checked against the four principles of WCAG.
        </p>

        <div className={styles.getStarted}>
          <InstallCommand command="npm i lilac-ui" />
          <div className={styles.actions}>
            <a className={`${styles.button} ${styles.primary}`} href="#components">
              Browse components
            </a>
            <a className={`${styles.button} ${styles.outlined}`} href="https://github.com/gesk-u">
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      <LilacSpecimen />
    </section>
  );
}