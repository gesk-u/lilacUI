import styles from './ComponentShowcase.module.css';
import { ButtonSpecimen } from './specimens/ButtonSpecimen';
import { SwitchSpecimen } from './specimens/SwitchSpecimen';
import { ChoiceGroupSpecimen } from './specimens/ChoiceGroupSpecimen';
import { DialogSpecimen } from './specimens/DialogSpecimen';

/* To add a component: create its folder, write a specimen in ./specimens, list it here */
export function ComponentShowcase() {
  return (
    <section className={styles.showcase} id="components" aria-labelledby="components-title">
      <header className={styles.header}>
        <h2 id="components-title" className={styles.title}>Try them with a keyboard</h2>
        <p className={styles.intro}>
          Every component below is live. Tab through it, and read the spec beside it.
        </p>
      </header>

      <div className={styles.plate}>
        <ButtonSpecimen />
        <SwitchSpecimen />
        <ChoiceGroupSpecimen />
        <DialogSpecimen />
      </div>
    </section>
  );
}
