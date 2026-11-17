import type { ReactNode } from "react";
import { SectionKicker } from "./EditorialText";

interface SectionHeadingProps {
  index: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "split" | "stack";
}

export default function SectionHeading({
  index,
  label,
  title,
  lede,
  align = "split",
}: SectionHeadingProps) {
  return (
    <header
      className={
        align === "split"
          ? "mb-12 grid gap-8 lg:mb-16 lg:grid-cols-12 lg:items-end"
          : "mb-12 max-w-3xl lg:mb-16"
      }
    >
      <div className={align === "split" ? "lg:col-span-8" : ""}>
        <SectionKicker index={index} label={label} />
        <h2 className="font-display-tight mt-5 text-[clamp(32px,4.2vw,52px)] font-bold text-silk-bright">
          {title}
        </h2>
      </div>
      {lede ? (
        <p
          className={
            align === "split"
              ? "prose-editorial max-w-md text-[15px] text-[#A1A1AA] lg:col-span-4 lg:justify-self-end"
              : "prose-editorial mt-5 max-w-xl text-[15px] text-[#A1A1AA]"
          }
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}
