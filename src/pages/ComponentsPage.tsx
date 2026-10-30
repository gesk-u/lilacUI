import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CodeTabs } from '../components/CodeTabs/CodeTabs';
import { COMPONENT_DOCS, type ComponentDoc } from '../content/componentDocs';
import styles from './ComponentsPage.module.css';

function DocSection({ doc }: { doc: ComponentDoc }) {
  const Demo = doc.demo;
  const titleId = `${doc.id}-title`;

  return (
    <section id={doc.id} className={styles.doc} aria-labelledby={titleId}>
      <header className={styles.docHeader}>
        {/* tabIndex -1: arriving from a landing-page link moves focus here, not just the scroll */}
        <h2 id={titleId} className={styles.docTitle} tabIndex={-1}>{doc.name}</h2>
        <p className={styles.summary}>{doc.summary}</p>
      </header>

      <div className={styles.demo}>
        <Demo />
      </div>

      <div className={styles.guidance}>
        <div>
          <h3 className={styles.subheading}>Use it for</h3>
          <ul className={styles.list}>
            {doc.use.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h3 className={styles.subheading}>Not for</h3>
          <ul className={styles.list}>
            {doc.avoid.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeading}>
          <h3 className={styles.subheading}>Code</h3>
          {doc.customizable && (
            <Link className={styles.textLink} to="/customizer">
              Restyle the {doc.name.toLowerCase()} in the Customizer →
            </Link>
          )}
        </div>
        <CodeTabs legend={`${doc.name} code format`} name={`${doc.id}-format`} files={doc.code} />
        <p className={styles.hint}>
          React needs the component’s folder from <code>src/components</code>. HTML and CSS work on their own, in
          Lilac’s colours.
        </p>
      </div>

      <div className={styles.block}>
        <h3 className={styles.subheading}>Props</h3>
        {/* Scrolls sideways on narrow screens instead of squeezing the type column */}
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`${doc.name} props`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">What it does</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((prop) => (
                <tr key={prop.name}>
                  <th scope="row"><code>{prop.name}</code></th>
                  <td><code>{prop.type}</code></td>
                  <td>{prop.default ? <code>{prop.default}</code> : <span className={styles.none}>none</span>}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.guidance}>
        <div>
          <h3 className={styles.subheading}>Keyboard</h3>
          <dl className={styles.keys}>
            {doc.keyboard.map(({ keys, action }) => (
              <div key={keys.join('+')} className={styles.keyRow}>
                <dt>
                  {keys.map((key, index) => (
                    <span key={key}>
                      {index > 0 && ' + '}
                      <kbd>{key}</kbd>
                    </span>
                  ))}
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className={styles.subheading}>Accessibility</h3>
          <ul className={styles.list}>
            {doc.accessibility.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function ComponentsPage() {
  const { hash } = useLocation();

  // The router doesn't follow #hashes, so scroll to the component and move focus to its heading
  useEffect(() => {
    const heading = hash && document.getElementById(`${decodeURIComponent(hash.slice(1))}-title`);
    if (!heading) {
      // No section asked for: start at the top, not wherever the last page was scrolled to
      window.scrollTo(0, 0);
      return;
    }
    heading.scrollIntoView({ block: 'start' });
    heading.focus({ preventScroll: true });
  }, [hash]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Components</h1>
        <p className={styles.intro}>
          Each one is live: try it with a keyboard, then copy the code in React, HTML or CSS.
        </p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Components">
          <p className={styles.tocTitle} aria-hidden="true">On this page</p>
          <ul>
            {COMPONENT_DOCS.map((doc) => (
              <li key={doc.id}>
                <Link to={`#${doc.id}`} aria-current={hash === `#${doc.id}` ? 'location' : undefined}>
                  {doc.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.docs}>
          {COMPONENT_DOCS.map((doc) => <DocSection key={doc.id} doc={doc} />)}
        </div>
      </div>
    </div>
  );
}
