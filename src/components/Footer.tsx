import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { readCursorEnabled, writeCursorEnabled } from "../web/cursorPreference";

export default function Footer() {
  const [cursorOn, setCursorOn] = useState(readCursorEnabled);

  const toggleCursor = () => {
    const next = !cursorOn;
    setCursorOn(next);
    writeCursorEnabled(next);
  };

  return (
    <footer className="relative z-10 border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-6 py-6 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#71717A] md:flex-row md:items-center md:justify-between lg:px-10">
        <span>© 2026 Sanjeevi Kumar P</span>
        <span className="hidden md:inline">Designed &amp; built in Tamil Nadu</span>

        <button
          type="button"
          role="switch"
          aria-checked={cursorOn}
          onClick={toggleCursor}
          className="group inline-flex items-center gap-2.5 self-start text-[#A1A1AA] transition-colors hover:text-white md:self-auto"
        >
          <span>Spider Cursor</span>
          <span
            aria-hidden="true"
            className={`relative h-[14px] w-[26px] rounded-full border transition-colors duration-300 ${
              cursorOn
                ? "border-[#E11D48]/60 bg-[#E11D48]/25"
                : "border-white/15 bg-white/[0.04]"
            }`}
          >
            <span
              className={`absolute top-[2px] h-[8px] w-[8px] rounded-full transition-transform duration-300 ${
                cursorOn
                  ? "translate-x-[13px] bg-[#FB7185]"
                  : "translate-x-[2px] bg-[#71717A]"
              }`}
            />
          </span>
          <span className={cursorOn ? "text-[#FB7185]" : "text-[#71717A]"}>
            {cursorOn ? "On" : "Off"}
          </span>
        </button>

        <a
          href="#top"
          className="group inline-flex items-center gap-1.5 transition-colors hover:text-white"
        >
          Back to top
          <ArrowUp
            size={11}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
    </footer>
  );
}
