import { useId, useState, type FocusEvent } from 'react';
import { Button } from '../Button/Button';
import styles from './LilacSpecimen.module.css';

const CENTER_X = 380;
const CENTER_Y = 230;

// A lilac petal: pointed at the tube, broad and rounded at the tip.
const LOBE =
  'M380 230C366 198 314 170 314 124C314 90 342 70 374 72C408 74 432 98 428 132C424 172 392 198 380 230Z';
const LOBE_CUP = 'M378 218C376 180 374 140 372 92M376 168C362 150 342 140 326 136M375 136C386 120 392 104 394 90';
const LOBE_VEIN = 'M377 190C392 176 406 168 420 164';

const PRINCIPLES = [
  { id: 'perceivable', name: 'Perceivable', note: 'Text meets 4.5 : 1 contrast. Images carry text alternatives.', angle: -45, dot: [267, 113], leader: 'M267 113H212' },
  { id: 'operable', name: 'Operable', note: 'Every action works by keyboard. Try Tab right here.', angle: 45, dot: [493, 113], leader: 'M493 113H548' },
  { id: 'understandable', name: 'Understandable', note: 'Labels stay visible. Results are predictable.', angle: -135, dot: [267, 347], leader: 'M267 347H212' },
  { id: 'robust', name: 'Robust', note: 'Native elements first, so assistive tech understands them.', angle: 135, dot: [493, 347], leader: 'M493 347H548' },
] as const;

const DRAWING_LABEL = 'Lilac floret with four principle petals, growing from roots of semantic HTML';

const CONTRAST_STEPS = ['#fdfbff', '#bca9de', '#8c74bd', '#4b3478', '#2a1d45'];

export function LilacSpecimen() {
  // Unique ids, so two specimens on one page never share an id.
  const uid = useId().replace(/[^\w-]/g, '');
  const wobbleId = `${uid}-wobble`;
  const readerId = `${uid}-reader`;
  const noteId = (id: string) => `${uid}-note-${id}`;

  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [showReader, setShowReader] = useState(false);

  // One handler for both ways of picking a principle: clicking its petal or its name.
  const choose = (index: number) => {
    const id = PRINCIPLES[index].id;
    setActive(index);
    setSelected((current) => (current === id ? null : id));
  };

  const onNoteFocus = (index: number, event: FocusEvent<HTMLButtonElement>) => {
    setActive(index);
    // Ring the matching petal for keyboard focus only, not after a mouse click.
    if (event.currentTarget.matches(':focus-visible')) setFocused(index);
  };

  const current = PRINCIPLES[active];
  const announcement = `${current.name}, toggle button, ${selected === current.id ? 'pressed' : 'not pressed'}. ${current.note}`;

  return (
    <div className={styles.specimen}>
      <figure className={styles.figure}>
        {/* The notes come before the drawing so they're read first; CSS draws them on top of it. */}
        <ol className={styles.notes}>
          {PRINCIPLES.map((principle, index) => (
            <li
              key={principle.id}
              className={styles.note}
              data-principle={principle.id}
              data-active={index === active || undefined}
            >
              <button
                type="button"
                className={styles.noteButton}
                aria-pressed={selected === principle.id}
                aria-describedby={noteId(principle.id)}
                onClick={() => choose(index)}
                onFocus={(event) => onNoteFocus(index, event)}
                onBlur={() => setFocused(null)}
                onMouseEnter={() => setActive(index)}
              >
                {principle.name}
                {selected === principle.id && <span aria-hidden="true"> ✓</span>}
              </button>
              <span id={noteId(principle.id)} className={styles.noteText}>
                {principle.note}
              </span>
            </li>
          ))}
          <li className={styles.note} data-principle="root">
            <strong className={styles.noteName}>Shared root</strong>
            <span className={styles.noteText}>Semantic HTML: real buttons, labels and landmarks.</span>
          </li>
        </ol>

        <svg className={styles.drawing} viewBox="0 0 760 720" role="img" aria-label={DRAWING_LABEL}>
          <defs>
            <filter id={wobbleId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" />
              <feDisplacementMap in="SourceGraphic" scale="3.5" />
            </filter>
          </defs>

          <g filter={`url(#${wobbleId})`}>
            <path className={styles.stem} d="M380 244C374 330 390 450 380 560" />
            <path className={styles.leaf} d="M381 430C344 398 300 404 276 438C316 458 352 456 381 430Z" />
            <path className={styles.leafVein} d="M378 430C344 428 310 432 284 438" />
            <path className={styles.leaf} d="M383 476C420 446 462 450 488 482C450 500 412 498 383 476Z" />
            <path className={styles.leafVein} d="M386 476C420 474 452 478 480 482" />

            <path className={styles.ground} d="M232 560C300 556 360 563 420 558S640 556 720 561" />
            <path className={styles.groundHatch} d="M590 572l-12 12M640 572l-12 12M690 572l-12 12" />
            <path
              className={styles.roots}
              d="M380 560C376 590 356 612 296 628M380 560C368 610 344 650 334 676M380 560C390 612 420 646 446 676M380 560C396 590 430 610 486 626M352 604C330 610 318 606 300 600M410 620C430 630 446 630 462 640"
            />
          </g>

          <g className={styles.rootLabels}>
            <text x="246" y="640">&lt;main&gt;</text>
            <text x="294" y="702">&lt;nav&gt;</text>
            <text x="418" y="702">&lt;button&gt;</text>
            <text x="470" y="626">&lt;label&gt;</text>
          </g>

          <g className={styles.leaders}>
            <g>
              <path d="M352 572H212" />
              <circle cx="352" cy="572" r="3.5" />
            </g>
            {PRINCIPLES.map((principle, index) => (
              <g key={principle.id} data-active={index === active || undefined}>
                <path d={principle.leader} />
                <circle cx={principle.dot[0]} cy={principle.dot[1]} r="3.5" />
              </g>
            ))}
          </g>

          {/* Petals are mouse targets that do the same as the buttons in the notes.
              The buttons are the real controls, so the petals stay out of the Tab order. */}
          {PRINCIPLES.map((principle, index) => (
            <g
              key={principle.id}
              className={styles.petal}
              data-principle={principle.id}
              data-selected={selected === principle.id || undefined}
              data-focused={focused === index || undefined}
              onClick={() => choose(index)}
              onMouseEnter={() => setActive(index)}
            >
              <g
                transform={`translate(${CENTER_X} ${CENTER_Y}) scale(1.15) rotate(${principle.angle}) translate(${-CENTER_X} ${-CENTER_Y})`}
              >
                <path className={styles.petalRing} d={LOBE} />
                <path className={styles.petalGap} d={LOBE} />
                <path className={styles.petalHalo} d={LOBE} transform="translate(380 230) scale(1.04) translate(-380 -230)" />
                <path className={styles.petalLobe} d={LOBE} filter={`url(#${wobbleId})`} />
                <path className={styles.petalCup} d={LOBE_CUP} />
                <path className={styles.petalVein} d={LOBE_VEIN} />
              </g>
            </g>
          ))}

          <circle className={styles.floretTube} cx={CENTER_X} cy={CENTER_Y} r="15" />
          <circle className={styles.floretThroat} cx={CENTER_X} cy={CENTER_Y} r="5" />

          <g className={styles.scaleBar}>
            <text className={styles.scaleTitle} x="560" y="616">
              Contrast scale
            </text>
            {CONTRAST_STEPS.map((fill, i) => (
              <rect key={fill} x={560 + i * 36} y="630" width="36" height="14" fill={fill} />
            ))}
            <rect className={styles.scaleFrame} x="560" y="630" width="180" height="14" />
            <path className={styles.scaleMark} d="M668 622V652" />
            <text x="560" y="674">1 : 1</text>
            <text x="646" y="674">4.5 : 1</text>
          </g>
        </svg>
      </figure>

      <div className={styles.tools}>
        <Button
          variant="secondary"
          aria-expanded={showReader}
          aria-controls={readerId}
          onClick={() => setShowReader((value) => !value)}
        >
          {showReader ? 'Hide screen reader output' : 'Show screen reader output'}
        </Button>
      </div>

      <div className={styles.readerOutput} id={readerId} hidden={!showReader}>
        <span className={styles.readerLabel}>Screen reader announces</span>
        <code>{DRAWING_LABEL}, image.</code>
        <code>{announcement}</code>
      </div>
    </div>
  );
}