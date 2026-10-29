import type { HTMLAttributes } from "react";
import { LilacMark } from "./LilacMark";
import type { MarkDetail } from "./LilacMark";
import styles from "./Logo.module.css";

export interface LilacLogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Wordmark size. Everything else scales from it in em. */
  size?: number | string;
  /** Accessible name for the whole lockup. */
  label?: string;
  /** Drop the word and keep the floret. */
  markOnly?: boolean;
  detail?: MarkDetail;
}

/** The floret standing in for the dot on an i. */
function Tittle({ detail }: { detail: MarkDetail }) {
  return (
    <span className={styles.dotless}>
      {"\u0131"}
      <LilacMark className={styles.tittle} detail={detail} />
    </span>
  );
}

export function LilacLogo({
  size,
  label = "Lilac UI",
  markOnly = false,
  detail = "auto",
  className,
  style,
  ...rest
}: LilacLogoProps) {
  const resolved: MarkDetail =
    detail === "auto" && typeof size === "number" && size < 36
      ? "simple"
      : detail;

  return (
    <span
      className={[styles.lockup, className].filter(Boolean).join(" ")}
      style={size !== undefined ? { fontSize: size, ...style } : style}
      role="img"
      aria-label={label}
      {...rest}
    >
      <LilacMark className={styles.lockupMark} detail={resolved} />
      {!markOnly && (
        <span className={styles.word} aria-hidden="true">
          l<Tittle detail={resolved} />lac u<Tittle detail={resolved} />
        </span>
      )}
    </span>
  );
}