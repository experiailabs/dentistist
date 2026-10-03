import { useEffect } from "react";
import { ArrowUpRight, Boxes, HeartPulse, Plus } from "lucide-react";
import { Link } from "wouter";

// Add future projects here with their corresponding route in App.tsx.
const projects = [
  { id: "demo1", title: "Bookable Clinic", category: "Healthcare · Clinic dashboard", description: "A calmer way to manage waitlists, recover appointments, and bring patients back.", href: "/demo1" },
];

export default function Projects() {
  useEffect(() => { document.title = "Projects · Demo Collection"; }, []);
  return (
    <div className="projects-page">
      <header className="projects-header"><Link href="/" className="projects-brand"><Boxes size={23} /><span>Project collection</span></Link><span className="projects-header-note">Ideas brought to life</span></header>
      <main className="projects-main">
        <section className="projects-intro"><p className="projects-eyebrow">THE SHOWCASE</p><h1>One place.<br />Many possibilities<span>.</span></h1><p>Explore my projects, try the demos, and see what’s coming next.</p><div className="projects-count"><span />{projects.length} project ready to explore</div></section>
        <section aria-labelledby="projects-heading"><div className="projects-section-heading"><h2 id="projects-heading">My projects</h2><span>01 — 03</span></div><div className="projects-grid">
          {projects.map((project) => <Link href={project.href} key={project.id} className="project-card"><div className="project-preview"><div className="project-preview-top"><span className="project-icon"><HeartPulse size={24} /></span><span className="project-status">Available demo</span></div><div className="project-mini-dashboard" aria-hidden="true"><div className="project-mini-sidebar"><HeartPulse size={14} /><i /><i /><i /></div><div className="project-mini-content"><strong>Good morning, Anara</strong><span>Your clinic, at a glance.</span><div className="project-mini-stats"><div><b>24</b><small>Open slots</small></div><div><b>126</b><small>Recovered</small></div><div><b>94%</b><small>Confirmed</small></div></div><div className="project-mini-chart">{[32, 48, 38, 66, 54, 82, 96].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></div></div></div><div className="project-card-body"><div className="project-card-meta"><span>{project.id.toUpperCase()}</span><span>{project.category}</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="project-card-footer"><span>Explore project</span><ArrowUpRight size={19} /></div></div></Link>)}
          {[2, 3].map((number) => <article className="project-card project-coming" key={number}><div className="project-placeholder"><Plus size={32} strokeWidth={1} /><span>Room for the next idea</span></div><div className="project-card-body"><div className="project-card-meta"><span>DEMO{number}</span><span>Coming soon</span></div><h3>More on the way</h3><p>A new project will find its home here. Stay tuned for what’s next.</p><div className="project-card-footer"><span>In the works</span><span className="project-coming-dot" /></div></div></article>)}
        </div></section>
      </main>
      <footer className="projects-footer"><span>Built to explore. Made to grow.</span><span>Project collection · 2026</span></footer>
    </div>
  );
}
