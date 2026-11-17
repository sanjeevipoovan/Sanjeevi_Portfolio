import { useMemo } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { profile } from "../data/portfolio";
import { buildCornerWebGeometry } from "../web/backdropGeometry";
import {
  EditorialSerifWord,
  HighlightedProse,
  KineticMetricNumber,
} from "./EditorialText";

const domainTags = ["RAG", "Agentic systems", "Voice AI", "LLM evaluation"];

const proof = [
  { value: "41", label: "Capabilities mapped" },
  { value: "05", label: "Production projects" },
  { value: "02", label: "Industry internships" },
  { value: "2026", label: "Graduating class" },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  const halo = useMemo(
    () =>
      buildCornerWebGeometry({
        cx: 200,
        cy: 232,
        maxRadius: 196,
        startDeg: -90,
        endDeg: 270,
        spokeCount: 14,
        ringCount: 7,
        sagFactor: 0.028,
      }),
    []
  );

  return (
    <section id="top" className="relative z-10">
      <div className="mx-auto max-w-[1360px] px-6 pb-0 pt-12 lg:px-10 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-[#E11D48]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#D4D4D8]">
                AI Engineer · LLM Systems
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-white/[0.09]" />
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[#71717A] sm:block">
                2026
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="font-display-tight mt-8 text-[clamp(40px,5.4vw,58px)] font-bold text-silk-bright"
            >
              AI systems that hold up in <EditorialSerifWord>production</EditorialSerifWord>.
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="prose-editorial mt-6 max-w-xl text-[15.5px] text-[#D4D4D8]"
            >
              <HighlightedProse
                text={profile.summary}
                highlights={["LLM systems", "Scalabox Technology"]}
              />
            </motion.p>

            <motion.ul
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#A1A1AA]"
            >
              {domainTags.map((tag, index) => (
                <li key={tag} className="flex items-center gap-2">
                  <span>{tag}</span>
                  {index < domainTags.length - 1 ? (
                    <span aria-hidden="true" className="text-[#E11D48]">
                      ·
                    </span>
                  ) : null}
                </li>
              ))}
            </motion.ul>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="#work"
                className="group inline-flex items-center gap-2 rounded-full bg-[#E11D48] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[#BE123C]"
              >
                Explore Projects
                <ArrowUpRight
                  size={14}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#capabilities"
                className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.015] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D4D4D8] transition-colors duration-300 hover:border-white/25 hover:text-white"
              >
                <Layers3
                  size={14}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="text-[#FB7185]"
                />
                Inspect Stack Web
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="group relative mx-auto w-full max-w-[452px] lg:col-span-5 lg:ml-auto"
          >
            <div className="relative overflow-hidden border border-white/[0.08] bg-[#0B0B0E]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-px -top-px z-30 h-6 w-6 border-l border-t border-[#E11D48]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-px -top-px z-30 h-6 w-6 border-r border-t border-white/25"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-px -left-px z-30 h-6 w-6 border-b border-l border-white/15"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-px -right-px z-30 h-6 w-6 border-b border-r border-white/15"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_58%_at_50%_34%,rgba(225,29,72,0.20),transparent_72%)]"
              />

              <div className="relative aspect-[10/13]">
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105">
                  <svg
                    viewBox="0 0 400 520"
                    className="h-[92%] w-[92%] opacity-70"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    {halo.spokes.map((d, index) => (
                      <path
                        key={`spoke-${index}`}
                        d={d}
                        stroke="rgba(228,228,231,0.13)"
                        strokeWidth="0.7"
                      />
                    ))}
                    {halo.rings.map((d, index) => (
                      <path
                        key={`ring-${index}`}
                        d={d}
                        stroke="rgba(225,29,72,0.16)"
                        strokeWidth="0.65"
                      />
                    ))}
                    {halo.plumbLines.map((d, index) => (
                      <path
                        key={`plumb-${index}`}
                        d={d}
                        stroke="rgba(251,113,133,0.22)"
                        strokeWidth="0.6"
                        strokeDasharray="2 4"
                      />
                    ))}
                    {halo.knots.map((knot, index) => (
                      <circle
                        key={`knot-${index}`}
                        cx={knot.x}
                        cy={knot.y}
                        r="0.9"
                        fill="rgba(255,255,255,0.34)"
                      />
                    ))}
                  </svg>
                </div>

                <img
                  src="/portrait.webp"
                  alt="Portrait of Sanjeevi Kumar P"
                  width="900"
                  height="1236"
                  decoding="async"
                  className="relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-[#08080A] via-[#08080A]/80 to-transparent" />

                <figcaption className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-4 px-4 pb-4 font-mono text-[9px] uppercase tracking-[0.18em]">
                  <span className="text-[#D4D4D8]">{profile.name}</span>
                  <span className="text-right text-[#71717A]">
                    AI Engineer
                    <span className="mx-1.5 text-[#E11D48]">·</span>
                    2026
                  </span>
                </figcaption>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 border-y border-white/[0.08] lg:mt-20 lg:grid-cols-4"
        >
          {proof.map((item, index) => (
            <div
              key={item.label}
              className={`group relative px-5 py-6 lg:px-7 ${
                index % 2 === 1 ? "border-l border-white/[0.07]" : ""
              } ${index >= 2 ? "border-t border-white/[0.07] lg:border-t-0" : ""} ${
                index === 2 ? "lg:border-l" : ""
              } ${index === 3 ? "lg:border-l lg:border-white/[0.07]" : ""}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#E11D48] to-[#FB7185]/40 transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
              <dd className="flex items-baseline gap-2">
                <KineticMetricNumber
                  value={Number(item.value)}
                  pad={item.value.length}
                  className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#F4F4F5]"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#71717A]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </dd>
              <dt className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#A1A1AA]">
                {item.label}
              </dt>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
