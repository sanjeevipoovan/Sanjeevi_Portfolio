import { profile } from "../data/portfolio";
import Reveal from "./Reveal";
import WebCta from "./WebCta";
import { SectionKicker } from "./EditorialText";

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7.5 12 13l8-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6.3 3.5h2.9l1.5 3.7-2 1.4a12.5 12.5 0 0 0 5.7 5.7l1.4-2 3.7 1.5v2.9a2 2 0 0 1-2.2 2 17 17 0 0 1-14.9-14.9 2 2 0 0 1 1.9-2.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M20.4 20.5h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.9 3.3-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3ZM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1Zm1.8 13.1H3.6V9h3.5v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 1 .8 1.7 1.8 1.7h20.4c1 0 1.8-.7 1.8-1.7V1.7c0-.9-.8-1.7-1.8-1.7Z" />
    </svg>
  );
}

function LeetcodeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M13.5 0c-.4 0-.7.2-1 .4L7.1 6.2 3.3 10.3a5.3 5.3 0 0 0-1.2 2.1 5.5 5.5 0 0 0-.1.5 5.5 5.5 0 0 0 .1 2.4 5.9 5.9 0 0 0 .3 1 5.9 5.9 0 0 0 1.3 1.8l4.3 4.2a5.9 5.9 0 0 0 8.1-.1l2.4-2.4c.5-.5.5-1.4 0-2a1.4 1.4 0 0 0-2 0l-2.4 2.4a3 3 0 0 1-4.2 0l-4.3-4.2a3 3 0 0 1-.9-2.3 2.5 2.5 0 0 1 .1-.5c.1-.4.3-.8.6-1.2l4.3-4.6c1-1.1 3.2-1.3 4.4-.3l3.5 2.9c.6.5 1.5.4 2-.2a1.4 1.4 0 0 0-.3-2l-3.5-2.8a6.5 6.5 0 0 0-2.8-1.2l2-2.2A1.4 1.4 0 0 0 13.5 0Zm-2.9 12.8a1.4 1.4 0 0 0 0 2.8h10.2a1.4 1.4 0 0 0 0-2.8H10.6Z" />
    </svg>
  );
}

const ICONS = {
  Email: MailIcon,
  Phone: PhoneIcon,
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  LeetCode: LeetcodeIcon,
};

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  ...profile.links.map((link) => ({
    label: link.label,
    value: link.handle,
    href: link.href,
    external: true,
  })),
];

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="contact-glow" aria-hidden="true" />
      <div className="container contact-inner">
        <SectionKicker index="05" label="Contact" />

        <Reveal as="h2" className="contact-title" delay={60}>
          Let’s build something <em>worth deploying.</em>
        </Reveal>

        <Reveal as="p" className="contact-lede" delay={120}>
          Open to AI Engineer and LLM Engineer roles — and always up for a hard problem, a
          last-minute hackathon, or a second pair of eyes on your retrieval layer.
        </Reveal>

        <Reveal className="contact-cta" delay={180}>
          <WebCta href={`mailto:${profile.email}?subject=Let’s%20work%20together`} />
        </Reveal>

        <div className="contact-links">
          {links.map((link, index) => {
            const Icon = ICONS[link.label];
            return (
              <Reveal
                as="a"
                className="contact-icon"
                key={link.label}
                delay={index * 40}
                href={link.href}
                aria-label={`${link.label} — ${link.value}`}
                title={link.value}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="ci-glyph">
                  <Icon />
                </span>
                <span className="ci-label">{link.label}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
