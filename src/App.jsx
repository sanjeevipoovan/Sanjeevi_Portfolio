import { MotionConfig } from "motion/react";
import TopNav from "./components/TopNav";
import { SpiderWebBackdrop } from "./components/SpiderWebBackdrop";
import ClickWeb from "./components/ClickWeb";
import SpiderCursor from "./components/SpiderCursor";
import HeroSection from "./components/HeroSection";
import PersonalProjectsSection from "./components/PersonalProjectsSection";
import Experience from "./components/Experience";
import Capabilities from "./components/Capabilities";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>
      <SpiderWebBackdrop />
      <div className="page-layer">
        <ClickWeb />
        <SpiderCursor />
        <TopNav />
        <main id="main">
          <HeroSection />
          <PersonalProjectsSection />
          <Experience />
          <Capabilities />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
