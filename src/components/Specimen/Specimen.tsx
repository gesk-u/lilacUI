import { useId, type ReactNode } from 'react';
import styles from './Specimen.module.css';

export type SpecEntry = {
  term: string;
  detail: ReactNode;
};

type SpecimenProps = {
  title: string;
  description: ReactNode;
  spec: SpecEntry[];
  /* The live component(s), shown in the middle column */
  children: ReactNode;
};

/* One row of the components plate: identity, live stage, spec table */
export function Specimen({ title, description, spec, children }: SpecimenProps) {
  const titleId = useId();

  return (
    <section className={styles.specimen} aria-labelledby={titleId}>
      <div className={styles.ident}>
        <h3 id={titleId} className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.stage}>{children}</div>

      <div className={styles.spec}>
        <dl>
          {spec.map(({ term, detail }) => (
            <div key={term} className={styles.specRow}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function SpecimenStates({ children }: { children: ReactNode }) {
  return <div className={styles.states}>{children}</div>;
}

/* A component instance with a small caption naming its state */
export function SpecimenState({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className={styles.state}>
      {children}
      <small className={styles.caption}>{caption}</small>
    </div>
  );
}

/* Live feedback under the stage, announced to screen readers */
export function SpecimenNote({ children }: { children: ReactNode }) {
  return <p className={styles.note} role="status">{children}</p>;
}

export function Keys({ keys }: { keys: string[] }) {
  return (
    <span className={styles.keys}>
      {keys.map((key) => <kbd key={key}>{key}</kbd>)}
    </span>
  );
}
