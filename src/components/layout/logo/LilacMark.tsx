import { useId } from "react";
import type { SVGProps } from "react";
import { fullMark, simpleMark } from "./Markpaths";
import styles from "./Logo.module.css";

export type MarkDetail = "auto" | "full" | "simple";

export interface LilacMarkProps
  extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  /** Rendered size. A number is treated as px. Omit to size it with CSS. */
  size?: number | string;
  /** `auto` drops to the simplified drawing below 40px. */
  detail?: MarkDetail;
  /**
   * Accessible name. Omit it when the mark sits next to the word "Lilac UI",
   * so screen readers don't announce the name twice.
   */
  title?: string;
}

function resolveDetail(detail: MarkDetail, size?: number | string) {
  if (detail !== "auto") return detail;
  return typeof size === "number" && size < 40 ? "simple" : "full";
}

export function LilacMark({
  size,
  detail = "auto",
  title,
  className,
  ...rest
}: LilacMarkProps) {
  const titleId = useId();
  const labelled = title !== undefined;

  return (
    <svg
      viewBox="-34 -34 468 468"
      width={size}
      height={size}
      className={[styles.mark, className].filter(Boolean).join(" ")}
      role={labelled ? "img" : undefined}
      aria-labelledby={labelled ? titleId : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      {labelled && <title id={titleId}>{title}</title>}
      {resolveDetail(detail, size) === "simple" ? simpleMark : fullMark}
    </svg>
  );
}