import Reveal from "./Reveal";
import { SectionKicker } from "./EditorialText";

export default function SecHead({ num, title, lede }) {
  const [index, ...rest] = String(num).split(/[·/]/);
  const label = rest.join(" ").trim();

  return (
    <header className="sec-head">
      <div className="sec-label">
        <SectionKicker index={index.trim()} label={label} />
      </div>
      <Reveal as="h2" className="sec-title" delay={60}>
        {title}
      </Reveal>
      {lede ? (
        <Reveal as="p" className="sec-lede" delay={120}>
          {lede}
        </Reveal>
      ) : null}
    </header>
  );
}
