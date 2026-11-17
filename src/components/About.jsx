import { achievements, education } from "../data/portfolio";
import Reveal from "./Reveal";
import SecHead from "./SecHead";

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <SecHead
          num="04 / About"
          title={
            <>
              The person behind the <em>prompts</em>
            </>
          }
          lede="Final-year AI & ML engineering student, building in public and in production."
        />

        <div className="about-grid">
          <Reveal className="about-main">
            <p className="about-lead">
              I got into AI by trying to make Tamil work inside modern tooling — and stayed for the
              engineering it takes to make a model useful once the demo ends.
            </p>
            <p>
              Most of my work sits where language models meet real systems: retrieval that stays
              grounded in the source, agents that hand off cleanly, and APIs that stream a response
              before the user notices it started. I care about the parts that are easy to skip —
              evaluation, latency budgets, PII redaction, and knowing exactly when the model should
              say nothing at all.
            </p>
            <p>
              Outside of that: 24-hour hackathons, local model deployment on constrained hardware,
              and a growing list of Tamil language experiments.
            </p>
            <div className="about-facts">
              <div>
                <span className="fact-key">Currently</span>
                <span className="fact-value">AI Developer Intern, Scalabox Technology</span>
              </div>
              <div>
                <span className="fact-key">Open to</span>
                <span className="fact-value">AI / LLM Engineer roles — 2026</span>
              </div>
            </div>
          </Reveal>

          <div className="about-side">
            <Reveal className="panel" delay={80}>
              <h3 className="panel-title">Education</h3>
              {education.map((item) => (
                <div className="edu" key={item.school}>
                  <div className="edu-top">
                    <span className="edu-school">{item.school}</span>
                    <span className="edu-period">{item.period}</span>
                  </div>
                  <p className="edu-degree">{item.degree}</p>
                  <span className="edu-score">{item.score}</span>
                </div>
              ))}
            </Reveal>

            <Reveal className="panel" delay={150}>
              <h3 className="panel-title">Recognition</h3>
              <ul className="awards">
                {achievements.map((item) => (
                  <li key={item.title}>
                    <span className="award-dot" aria-hidden="true" />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
