import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { navLinks, profile } from "../data/portfolio";

const sectionIds = navLinks.map((link) => link.href.slice(1));

export default function TopNav() {
  const [active, setActive] = useState("#work");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08080A]/96">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#E11D48] via-[#FB7185]/80 to-[#E11D48]/30"
      />

      <div className="mx-auto hidden h-16 max-w-[1360px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 md:grid lg:px-10">
        <a href="#top" className="group flex items-center gap-2.5 justify-self-start">
          <span
            aria-hidden="true"
            className="h-2 w-2 rotate-45 bg-[#E11D48] transition-transform duration-300 group-hover:rotate-[135deg]"
          />
          <span className="whitespace-nowrap text-[12.5px] font-bold uppercase tracking-[0.22em] text-[#F4F4F5]">
            Sanjeevi Kumar
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative pb-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                  isActive ? "text-[#F4F4F5]" : "text-[#A1A1AA] hover:text-[#F4F4F5]"
                }`}
              >
                {link.label}
                {isActive ? (
                  <motion.span
                    layoutId="top-nav-underline"
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-px bg-[#E11D48]"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  />
                ) : null}
              </a>
            );
          })}
        </nav>

        <a
          href="#contact"
          className="group inline-flex items-center gap-2 justify-self-end rounded-full border border-white/[0.12] px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#D4D4D8] transition-colors duration-300 hover:border-[#E11D48]/50 hover:text-white"
        >
          <span>Let’s Talk</span>
          <ArrowUpRight
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
            className="text-[#E11D48] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>

      {/* Mobile: compact two-row header keeps all four sections visible at 390px. */}
      <div className="md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <a href="#top" className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-[#E11D48]" />
            <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-[#F4F4F5]">
              Sanjeevi Kumar
            </span>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#D4D4D8]"
          >
            Let’s Talk
            <ArrowUpRight size={11} aria-hidden="true" className="text-[#E11D48]" />
          </a>
        </div>
        <nav
          aria-label="Sections"
          className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.06] px-3 py-2"
        >
          {navLinks.map((link) => {
            const isActive = active === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  isActive
                    ? "bg-[#E11D48]/12 text-[#FB7185] ring-1 ring-[#E11D48]/35"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
      </div>

      <span className="sr-only">{profile.role} portfolio navigation</span>
    </header>
  );
}
