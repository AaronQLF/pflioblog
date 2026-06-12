"use client";

import React from 'react';
import Image from 'next/image';
import { withBasePath } from '@/lib/basePath';

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
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "KaTeX", "Framer Motion"],
    live: "https://mechanistic-interpretability-toolki.vercel.app/",
    github: "https://github.com/AaronQLF/mechanistic-Interpretability-Toolkit",
    image: "/images/projects/mechinterp.png",
    meta: "2026",
  },
  {
    title: "Threader.cloud",
    tagline: "Branching conversations for LLMs, the way multi-thread dialogue should work.",
    features: [
      "Fork any message into a new thread",
      "Visual tree of the conversation graph",
      "Bring-your-own-key, multi-model support",
    ],
    technologies: ["React", "Vite", "TypeScript", "Tailwind CSS", "OpenAI API"],
    live: "https://thread-ai-sigma.vercel.app/",
    image: "/images/projects/threader.png",
    meta: "2025",
  },
  {
    title: "TravelMate",
    tagline: "Itinerary generation from mood, timing, and a free-text trip brief.",
    features: [
      "Custom transformer fine-tuned on travel data",
      "Mood plus duration plus prose as input",
      "Itinerary output in natural language",
    ],
    technologies: ["Node.js", "Express", "MongoDB", "React", "Python", "Flask", "Hugging Face"],
    image: "/images/projects/TravelMate.png",
    meta: "2024",
  },
  {
    title: "C++ Online FPS",
    tagline: "First-person shooter on a hand-rolled engine.",
    features: [
      "Custom physics engine and OpenGL renderer",
      "AI enemy behavior trees",
      "Lua scripting hooks for gameplay logic",
    ],
    technologies: ["C++", "OpenGL", "Lua", "GLSL"],
    github: "https://github.com/AaronQLF/CppFirstShooter",
    image: "/images/projects/cpp.png",
    meta: "2023",
  },
];

const repos: Repo[] = [
  {
    name: "flash-attention",
    year: "2026",
    description:
      "Heavily-commented CUDA reimplementation of the FlashAttention forward pass — tiled attention with online softmax and shared-memory tiling (Dao et al., 2022).",
    technologies: ["CUDA", "C++"],
    github: "https://github.com/AaronQLF/flash-attention",
  },
  {
    name: "accountability",
    year: "2026",
    description:
      "Daily practice app serving three adaptive exercises a day: a LeetCode problem with a sandboxed in-browser test runner, a system-design prompt, and a math-for-ML derivation.",
    technologies: ["TypeScript", "Next.js"],
    github: "https://github.com/AaronQLF/accountability",
  },
  {
    name: "pflioblog",
    year: "2026",
    description:
      "This site — static-exported Next.js portfolio and blog, with a 3D semantic galaxy of posts built from MiniLM embeddings.",
    technologies: ["Next.js", "TypeScript", "Three.js"],
    github: "https://github.com/AaronQLF/pflioblog",
  },
  {
    name: "checkmyformapp",
    year: "2025",
    description:
      "React Native app for real-time exercise form feedback using pose detection — skeleton overlay, voice corrections, and rep counting.",
    technologies: ["React Native", "TypeScript"],
    github: "https://github.com/AaronQLF/checkmyformapp",
  },
  {
    name: "dashTemplate",
    year: "2025",
    description:
      "Streamlit-style declarative API for building Plotly Dash dashboards with a simple, intuitive syntax.",
    technologies: ["Python", "Dash"],
    github: "https://github.com/AaronQLF/dashTemplate",
  },
  {
    name: "ECSE439",
    year: "2025",
    description:
      "Model-driven engineering coursework — Acceleo model-to-text code generator for a TPS modeling language.",
    technologies: ["Java", "Acceleo"],
    github: "https://github.com/AaronQLF/ECSE439",
  },
  {
    name: "DBMS",
    year: "2024",
    description:
      "Small database engine in Python — a custom storage manager with trie-based indexing.",
    technologies: ["Python"],
    github: "https://github.com/AaronQLF/DBMS",
  },
  {
    name: "Miniature-x86-Linux-Debugger",
    year: "2024",
    description: "Minimal x86 debugger for Linux, written in C++.",
    technologies: ["C++", "Linux"],
    github: "https://github.com/AaronQLF/Miniature-x86-Linux-Debugger",
  },
  {
    name: "PDFTools",
    year: "2024",
    description:
      "Web-based PDF annotator that re-renders documents with wider margins, leaving room for handwritten notes.",
    technologies: ["JavaScript", "PDF.js"],
    github: "https://github.com/AaronQLF/PDFTools",
  },
  {
    name: "C-Shell",
    year: "2024",
    description: "Unix-style command-line shell implemented from scratch in C.",
    technologies: ["C"],
    github: "https://github.com/AaronQLF/C-Shell",
  },
  {
    name: "Colosseum_Survival_AI",
    year: "2024",
    description:
      "Game-playing agent for Colosseum Survival — a two-player barrier-placement strategy game — under strict time and memory limits.",
    technologies: ["Python"],
    github: "https://github.com/AaronQLF/Colosseum_Survival_AI",
  },
  {
    name: "Software-Validation",
    year: "2024",
    description:
      "Exploratory and API test suites against a REST todo-manager application (software validation coursework).",
    technologies: ["Java", "Maven"],
    github: "https://github.com/AaronQLF/Software-Validation",
  },
  {
    name: "DPMRepo",
    year: "2023",
    description:
      "McGill ECSE 211 design-project labs — robot sensor testing, data analysis, and navigation.",
    technologies: ["Python"],
    github: "https://github.com/AaronQLF/DPMRepo",
  },
  {
    name: "FINAL_PROJECT",
    year: "2023",
    description:
      "ECSE 211 robotics final project — sensor-driven robot control and deployment scripts in Python.",
    technologies: ["Python"],
    github: "https://github.com/AaronQLF/FINAL_PROJECT",
  },
];

const ProjectLinks: React.FC<{ project: Project }> = ({ project }) => (
  <span className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
    {project.live && (
      <a
        href={project.live}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
      >
        Live &rarr;
      </a>
    )}
    {project.github && (
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
      >
        GitHub &rarr;
      </a>
    )}
  </span>
);

// Full-card click without nesting anchors: a stretched primary link behind
// the content, with the explicit Live/GitHub anchors layered above it.
const StretchedLink: React.FC<{ project: Project }> = ({ project }) => {
  const href = project.live ?? project.github;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={project.title}
      className="absolute inset-0 z-0"
    />
  );
};

const FeaturedProject: React.FC<{ project: Project }> = ({ project }) => (
  <div className="card p-0 overflow-hidden group mb-6 relative">
    <StretchedLink project={project} />
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 h-full pointer-events-none">
      <div className="md:col-span-3 relative aspect-[16/10] md:aspect-auto md:min-h-[300px] bg-[var(--color-code-bg)] overflow-hidden border-b md:border-b-0 md:border-r border-[var(--color-border)]">
        <Image
          src={withBasePath(project.image)}
          alt={project.title}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 60vw"
        />
      </div>
      <div className="md:col-span-2 p-6 sm:p-7 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-accent)]">
            Featured
          </span>
          {project.meta && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {project.meta}
              </span>
            </>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="text-xl font-semibold font-sans group-hover:text-[var(--color-accent)] transition-colors duration-200">
            {project.title}
          </h3>
          <span className="pointer-events-auto">
            <ProjectLinks project={project} />
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {project.tagline}
        </p>
        <ul className="space-y-1.5 mb-5">
          {project.features.map((feat, i) => (
            <li
              key={i}
              className="text-[13px] text-[var(--color-muted)] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1 before:h-px before:bg-[var(--color-border)]"
            >
              {feat}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.technologies.map((tech, i) => (
            <span key={i} className="tag text-[10px]">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProjectTile: React.FC<{ project: Project }> = ({ project }) => {
  const clickable = Boolean(project.live ?? project.github);
  return (
    <div className="card p-0 overflow-hidden group h-full flex flex-col relative">
      <StretchedLink project={project} />
      <div className="pointer-events-none flex flex-col flex-1">
        <div className="relative aspect-video bg-[var(--color-code-bg)] overflow-hidden border-b border-[var(--color-border)]">
          <Image
            src={withBasePath(project.image)}
            alt={project.title}
            fill
            className={`object-cover object-top transition-transform duration-500 ${
              clickable ? 'group-hover:scale-[1.02]' : ''
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="p-6 flex flex-col flex-1">
          {project.meta && (
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-muted)] mb-2">
              {project.meta}
            </span>
          )}
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <h3
              className={`text-base font-semibold font-sans transition-colors duration-200 ${
                clickable ? 'group-hover:text-[var(--color-accent)]' : ''
              }`}
            >
              {project.title}
            </h3>
            <span className="pointer-events-auto">
              <ProjectLinks project={project} />
            </span>
          </div>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">
            {project.tagline}
          </p>
          <ul className="space-y-1 mb-4">
            {project.features.map((feat, i) => (
              <li
                key={i}
                className="text-[12px] text-[var(--color-muted)] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-1 before:h-px before:bg-[var(--color-border)]"
              >
                {feat}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.technologies.map((tech, i) => (
              <span key={i} className="tag text-[10px]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RepoRow: React.FC<{ repo: Repo }> = ({ repo }) => (
  <a
    href={repo.github}
    target="_blank"
    rel="noopener noreferrer"
    className="group grid grid-cols-[3.5rem_1fr] sm:grid-cols-[3.5rem_14rem_1fr_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b border-[var(--color-border)] last:border-b-0"
  >
    <span className="text-[11px] font-mono text-[var(--color-muted)]">{repo.year}</span>
    <span className="text-sm font-medium font-sans group-hover:text-[var(--color-accent)] transition-colors duration-200 break-all">
      {repo.name}
    </span>
    <span className="col-start-2 sm:col-start-3 text-[13px] text-[var(--color-muted)] leading-relaxed">
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
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">06</span>
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="section-heading mb-0">Projects</h2>
        <a
          href="https://github.com/AaronQLF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
        >
          GitHub &rarr;
        </a>
      </div>

      {featured && <FeaturedProject project={featured} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rest.map((project) => (
          <ProjectTile key={project.title} project={project} />
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-xs font-mono uppercase tracking-[0.12em] text-[var(--color-muted)] mb-2">
          More on GitHub
        </h3>
        <div>
          {repos.map((repo) => (
            <RepoRow key={repo.name} repo={repo} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard;
