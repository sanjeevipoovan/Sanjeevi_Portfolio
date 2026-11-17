import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { companies } from "../data/experience";
import { resolveSkill } from "../data/stack";
import Reveal from "./Reveal";
import SecHead from "./SecHead";
import TechIcon from "./TechIcon";
import { HighlightedProse } from "./EditorialText";

function CapabilityChip({ name }) {
  const skill = resolveSkill(name);
  if (!skill) {
    return (
      <span className="cap-chip">
        <TechIcon name={name} size={12} />
        <span>{name}</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      className="cap-chip cap-chip--link"
      onClick={() => {
        const target = document.getElementById("capabilities");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.dispatchEvent(new CustomEvent("cap:select", { detail: skill }));
      }}
    >
      <TechIcon name={name} size={12} />
      <span>{name}</span>
    </button>
  );
}

export default function Experience() {
  const [activeCompany, setActiveCompany] = useState(companies[0].id);
  const [subFilter, setSubFilter] = useState("all");

  const company = companies.find((c) => c.id === activeCompany) || companies[0];
  const visibleProjects =
    subFilter === "all"
      ? company.projects
      : company.projects.filter((p) => p.id === subFilter);

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <SecHead
          num="02 · Professional Experience"
          title={
            <>
              Industry experience in <em>production</em>
            </>
          }
          lede={
            <HighlightedProse
              text="Internships spent in the unglamorous half of AI: streaming backends, error analysis, and getting models to behave under real traffic."
              highlights={["streaming backends", "error analysis"]}
            />
          }
        />

        <div className="exp-layout">
          <div className="exp-rail" role="tablist" aria-label="Companies">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCompany === c.id}
                className={`exp-card ${activeCompany === c.id ? "is-active" : ""}`}
                onClick={() => {
                  setActiveCompany(c.id);
                  setSubFilter("all");
                }}
              >
                {activeCompany === c.id ? (
                  <motion.span
                    layoutId="exp-indicator"
                    className="exp-indicator"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                ) : null}
                <span className="exp-card-name">{c.name}</span>
                <span className="exp-card-role">{c.role}</span>
                <div className="exp-card-meta">
                  <span>{c.place}</span>
                  <span>·</span>
                  <span>{c.period}</span>
                </div>
                <span className="exp-card-shipped">{c.shipped} Shipped Projects</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={company.id}
              className="exp-stage"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="exp-summary">{company.summary}</p>

              <div className="exp-subtabs" role="tablist" aria-label="Projects">
                <button
                  type="button"
                  className={`exp-subtab ${subFilter === "all" ? "is-active" : ""}`}
                  onClick={() => setSubFilter("all")}
                >
                  All
                </button>
                {company.projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`exp-subtab ${subFilter === p.id ? "is-active" : ""}`}
                    onClick={() => setSubFilter(p.id)}
                  >
                    Project {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <div className="exp-projects">
                {visibleProjects.map((p) => (
                  <div className="exp-project" key={p.id}>
                    <h3 className="exp-project-title">{p.title}</h3>
                    <div className="exp-contrib">
                      <h4 className="exp-contrib-head">Engineering Contributions</h4>
                      <ul className="exp-contrib-list">
                        {p.contributions.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="exp-stack">
                      {p.stack.map((s) => (
                        <CapabilityChip key={s} name={s} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
