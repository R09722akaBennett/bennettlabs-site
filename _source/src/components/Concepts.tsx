import { useEffect, useRef, useState, type RefObject } from "react";
import {
  capabilities,
  experience,
  faqs,
  focusAreas,
  metrics,
  process,
  profile,
  projects,
  stackGroups
} from "../data/profile";

function useScrollVisible<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function FadeSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const [ref, visible] = useScrollVisible<HTMLElement>();
  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      id={id}
      className={`fade-in-section ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "\u2600\uFE0F Light" : "\uD83C\uDF19 Dark"}
    </button>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`back-to-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      &#8593;
    </button>
  );
}

function SiteNav() {
  return (
    <header className="site-nav" aria-label="Site navigation">
      <a className="brand" href="#home">
        {profile.brand}
      </a>
      <nav>
        <a href="#projects">Projects</a>
        <a href="#capabilities">Capabilities</a>
        <a href="#process">Process</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}

function SocialLinks() {
  return (
    <div className="social-links">
      <a href={profile.links.github} target="_blank" rel="noreferrer">
        GitHub
      </a>
      <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <a href={profile.links.instagram} target="_blank" rel="noreferrer">
        Instagram
      </a>
    </div>
  );
}

export function ConceptEditorial() {
  return (
    <>
      <SiteNav />

      <section id="home" className="concept hero-surface">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">{profile.role}</p>
            <h1>{profile.tagline}</h1>
            <p className="lead-copy">{profile.intro}</p>
            <div className="button-row">
              <a className="btn btn-primary" href="#projects">
                Explore Projects
              </a>
              <a className="btn btn-ghost" href={profile.resumeUrl}>
                Download Resume
              </a>
            </div>
            <ul className="chip-row" aria-label="Focus areas">
              {focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className="profile-panel">
            <p className="key">Name</p>
            <h2>{profile.name}</h2>
            <p className="key">Location</p>
            <p>{profile.location}</p>
            <p className="key">Availability</p>
            <p>{profile.availability}</p>
            <p className="key">Email</p>
            <a className="mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <SocialLinks />
          </aside>
        </div>
      </section>

      <FadeSection className="concept metrics-surface">
        <div className="section-heading">
          <p className="eyebrow">Professional Snapshot</p>
          <h2>What I optimize for in every AI engagement.</h2>
        </div>
        <div className="metrics-grid">
          {metrics.map((item) => (
            <article key={item.label}>
              <p className="key">{item.label}</p>
              <h3>{item.value}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="concept" id="projects">
        <div className="section-heading">
          <p className="eyebrow">Selected Projects</p>
          <h2>From practical side projects to production-minded systems.</h2>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article key={project.title} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <p className="impact">{project.impact}</p>
              <ul className="tag-list" aria-label={`${project.title} stack`}>
                {project.stack.map((stackItem) => (
                  <li key={stackItem}>{stackItem}</li>
                ))}
              </ul>
              <a href={project.href}>View case study</a>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="concept capability-surface" id="capabilities">
        <div className="section-heading">
          <p className="eyebrow">Capabilities</p>
          <h2>Engineering depth across product, architecture, and delivery.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="concept process-surface" id="process">
        <div className="section-heading">
          <p className="eyebrow">Working Process</p>
          <h2>A delivery model built for speed without sacrificing reliability.</h2>
        </div>
        <div className="process-list">
          {process.map((step) => (
            <article key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="concept" id="experience">
        <div className="section-heading">
          <p className="eyebrow">Experience</p>
          <h2>Built through shipping, debugging, and scaling in real environments.</h2>
        </div>
        <div className="experience-grid">
          <ol>
            {experience.map((item) => (
              <li key={item.title}>
                <span>{item.period}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
          <div className="stack-panel">
            <h3>Technical Toolkit</h3>
            {stackGroups.map((group) => (
              <article key={group.title}>
                <p className="key">{group.title}</p>
                <ul className="tag-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="concept faq-surface">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>Common questions before starting a collaboration.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </FadeSection>

      <FadeSection className="concept contact-surface" id="contact">
        <div className="contact-grid">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Let us build something useful and durable.</h2>
            <p>
              If you are building an AI product, modernizing workflow automation, or evaluating architecture decisions,
              I am open to discussing full-time roles, consulting, and technical partnerships.
            </p>
          </div>
          <aside>
            <a className="mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="button-row">
              <a className="btn btn-primary" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                Connect on LinkedIn
              </a>
              <a className="btn btn-ghost" href={profile.links.github} target="_blank" rel="noreferrer">
                View GitHub
              </a>
            </div>
            <SocialLinks />
          </aside>
        </div>
      </FadeSection>

      <footer className="site-footer">
        <p>{profile.name}</p>
        <p>{profile.role}</p>
      </footer>

      <BackToTop />
    </>
  );
}
