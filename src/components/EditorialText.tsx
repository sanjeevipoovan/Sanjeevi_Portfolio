import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/* Italic Cormorant focus word with a crimson underline that sweeps in. */
export function EditorialSerifWord({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <em
      className={`editorial-word relative inline-block whitespace-nowrap font-serif font-normal italic text-crimson-ink ${className}`}
    >
      {children}
      <motion.span
        aria-hidden="true"
        className="editorial-underline"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
    </em>
  );
}

/* Numbered chapter header with an extending gradient rule. */
export function SectionKicker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[#E11D48]">
        {index}
      </span>
      <motion.span
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-[#E11D48]/80 via-[#E11D48]/35 to-transparent"
        initial={{ width: 18, opacity: 0.4 }}
        whileInView={{ width: 64, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#71717A]">
        {label}
      </span>
    </div>
  );
}

/* Count-up counter that preserves leading zeros and respects reduced motion. */
export function KineticMetricNumber({
  value,
  pad = 2,
  className = "",
}: {
  value: number;
  pad?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let raf = 0;
    const start = performance.now();
    const duration = 950;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [inView, reduced, value]);

  const formatted = String(display).padStart(pad, "0");
  const finalValue = String(value).padStart(pad, "0");

  return (
    <span
      ref={ref}
      aria-label={finalValue}
      className={`tabular-nums ${className}`}
    >
      <span aria-hidden="true">{formatted}</span>
    </span>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Inline technical anchors, highlighted without shouting. */
export function HighlightedProse({
  text,
  highlights,
}: {
  text: string;
  highlights: string[];
}) {
  if (!highlights.length) return <>{text}</>;

  const pattern = new RegExp(
    `(${highlights.map(escapeRegExp).join("|")})`,
    "gi"
  );
  const lower = new Set(highlights.map((item) => item.toLowerCase()));

  return (
    <>
      {text.split(pattern).map((part, index) =>
        lower.has(part.toLowerCase()) ? (
          <mark
            key={`${part}-${index}`}
            className="border-b border-[#E11D48]/35 bg-transparent pb-px font-medium text-[#F4F4F5] [text-shadow:0_0_22px_rgba(225,29,72,0.22)]"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}
