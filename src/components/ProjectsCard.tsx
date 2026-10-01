"use client";

import React from 'react';
import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';
import MacWindowCard from './MacWindowCard';

interface Project {
  title: string;
  tagline: string;
  features: string[];
  technologies: string[];
  live?: string;
  github?: string;
  image: string;
  meta?: string;
  featured?: boolean;
}

interface Repo {
  name: string;
  year: string;
  description: string;
  technologies: string[];
  github: string;
}

const projects: Project[] = [
  {
    title: "personalGit",
    tagline: "Student second brain on an infinite canvas.",
    features: [
      "Independent workspaces with a multi-panel canvas",
      "PDF viewer with highlights and threaded comments",
      "Notion-like rich editor with KaTeX math and Mermaid diagrams",
      "Content-addressed, chunked, zstd-compressed storage on R2",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "React Flow",
      "Tiptap",
      "Supabase",
      "Cloudflare R2",
      "PDF.js",
      "Electron",
    ],
    live: "https://studygit-tau.vercel.app/",
    github: "https://github.com/AaronQLF/studygit",
    image: "/images/projects/personalgit.png",
    meta: "2026 · In development",
    featured: true,
  },
  {
    title: "Mech Interp Toolkit",
    tagline: "Interactive textbook for the math behind mechanistic interpretability.",
    features: [
      "Drag-and-scrub widgets on every page",
      "From vectors and matrices to attention circuits",
      "Sparse autoencoder visualizations",
    ],
    technologies: [
      "Next.js",
      "Tailwind CSS",
      "KaTeX",
      "React",
      "TypeScript",
    ],
    live: "https://aaronqlf.github.io/pflioblog/blog/mechanistic-interpretability-deep-dive",
    github: "https://github.com/AaronQLF/pflioblog",
    image: "/images/projects/mechinterp.png",
    meta: "2026 · Interactive research",
  },
  {
    title: "Divitae Eventure",
    tagline: "Systematic multi-asset trading fund & portfolio engine.",
    features: [
      "Real-time factor decomposition & mean-CVaR portfolio optimization",
      "Automated risk attribution & daily VaR reporting APIs",
      "15% of annual fund profits donated directly to leukemia research",
    ],
    technologies: [
      "Python",
      "cvxpy",
      "Snowflake",
      "Flask",
      "Docker",
    ],
    github: "https://github.com/AaronQLF",
    image: "/images/projects/divitae.png",
    meta: "2025 · Co-founded",
  },
];

const repos: Repo[] = [
  {
    name: "gflownet-scratch",
    year: "2026",
    description: "Discrete & Continuous GFlowNets from scratch in PyTorch with Trajectory Balance.",
    technologies: ["PyTorch", "Python", "GFlowNets"],
    github: "https://github.com/AaronQLF",
  },
  {
    name: "docp-optimal-control",
    year: "2026",
    description: "Discrete-Time Optimal Control Problem solvers with KKT conditions & Pontryagin PMP.",
    technologies: ["Python", "Control Theory", "NumPy"],
    github: "https://github.com/AaronQLF",
  },
  {
    name: "sae-feature-steering",
    year: "2026",
    description: "Sparse Autoencoder feature extraction & causal intervention toolkit for LLMs.",
    technologies: ["PyTorch", "Transformers", "SAE"],
    github: "https://github.com/AaronQLF",
  },
];

const FeaturedProject: React.FC<{ project: Project }> = ({ project }) => (
  <div className="mb-10 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]">
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="w-full lg:w-1/2 aspect-video relative rounded-lg overflow-hidden border border-[var(--color-border)]">
        <Image
          src={withBasePath(project.image)}
          alt={project.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
              Featured Build
            </span>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              {project.meta}
            </span>
          </div>

          <h3 className="text-2xl font-serif font-medium mb-1 text-[var(--color-fg)]">
            {project.title}
          </h3>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            {project.tagline}
          </p>

          <ul className="space-y-1.5 mb-5 text-xs text-[var(--color-fg)]">
            {project.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">›</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.map((t, i) => (
              <span key={i} className="tag text-[10px]">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="gloss-pill text-[var(--color-accent)] hover:underline"
              >
                Live Demo ↗
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-muted)] hover:text-[var(--color-fg)] underline"
              >
                GitHub Repo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProjectTile: React.FC<{ project: Project }> = ({ project }) => (
  <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between hover:border-[var(--color-accent)]/50 transition-colors">
    <div>
      <div className="flex items-center justify-between text-xs font-mono text-[var(--color-muted)] mb-2">
        <span>{project.meta}</span>
      </div>
      <h3 className="text-xl font-serif font-medium text-[var(--color-fg)] mb-1">
        {project.title}
      </h3>
      <p className="text-xs text-[var(--color-muted)] mb-4 leading-relaxed">
        {project.tagline}
      </p>

      <ul className="space-y-1 mb-4 text-xs text-[var(--color-fg)]">
        {project.features.map((f, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="text-[var(--color-accent)]">›</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <div className="flex flex-wrap gap-1 mb-4">
        {project.technologies.map((t, i) => (
          <span key={i} className="tag text-[10px]">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs font-mono">
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            Demo ↗
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted)] hover:text-[var(--color-fg)] underline"
          >
            GitHub
          </a>
        )}
      </div>
    </div>
  </div>
);

const RepoRow: React.FC<{ repo: Repo }> = ({ repo }) => (
  <a
    href={repo.github}
    target="_blank"
    rel="noopener noreferrer"
    className="group grid grid-cols-[3.5rem_1fr] sm:grid-cols-[3.5rem_14rem_1fr_auto] gap-x-4 gap-y-1 items-baseline py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] px-2 rounded transition-colors"
  >
    <span className="text-[11px] font-mono text-[var(--color-muted)]">{repo.year}</span>
    <span className="text-sm font-serif font-medium group-hover:text-[var(--color-accent)] transition-colors duration-200 break-all text-[var(--color-fg)]">
      {repo.name}
    </span>
    <span className="col-start-2 sm:col-start-3 text-[12px] text-[var(--color-muted)] leading-relaxed">
      {repo.description}
    </span>
    <span className="col-start-2 sm:col-start-4 flex flex-wrap gap-1.5 sm:justify-end">
      {repo.technologies.map((tech, i) => (
        <span key={i} className="tag text-[10px]">
          {tech}
        </span>
      ))}
    </span>
  </a>
);

const ProjectsCard: React.FC = () => {
  const featured = projects.find((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <MacWindowCard title="projects.sh" actionText="Open Source">
      <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-mono text-[var(--color-accent)] block uppercase tracking-wider mb-1">
            Build Registry
          </span>
          <h2 className="section-heading mb-0 text-2xl sm:text-3xl">Selected Projects</h2>
        </div>
        <a
          href="https://github.com/AaronQLF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          GitHub &rarr;
        </a>
      </div>

      {featured && <FeaturedProject project={featured} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {rest.map((project) => (
          <ProjectTile key={project.title} project={project} />
        ))}
      </div>

      <div className="pt-6 border-t border-[var(--color-border)]">
        <h3 className="text-xs font-mono uppercase tracking-[0.12em] text-[var(--color-muted)] mb-3">
          More Code & Research Repositories
        </h3>
        <div className="space-y-1">
          {repos.map((repo) => (
            <RepoRow key={repo.name} repo={repo} />
          ))}
        </div>
      </div>
    </MacWindowCard>
  );
};

export default ProjectsCard;
