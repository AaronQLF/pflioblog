"use client";

import React from 'react';
import Image from 'next/image';

interface Project {
  title: string;
  tagline: string;
  features: string[];
  technologies: string[];
  link?: string;
  image: string;
  meta?: string;
  featured?: boolean;
}

function getLinkLabel(link: string): string {
  if (link.includes('github.com')) return 'GitHub';
  return 'Live';
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
    link: "https://studygit-tau.vercel.app/",
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
    link: "https://mechanistic-interpretability-toolki.vercel.app/",
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
    link: "https://thread-ai-sigma.vercel.app/",
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
    link: "https://github.com/harounguessous/CppFirstShooter",
    image: "/images/projects/cpp.png",
    meta: "2023",
  },
];

const FeaturedProject: React.FC<{ project: Project }> = ({ project }) => {
  const content = (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 h-full">
      <div className="md:col-span-3 relative aspect-[16/10] md:aspect-auto md:min-h-[300px] bg-[var(--color-code-bg)] overflow-hidden border-b md:border-b-0 md:border-r border-[var(--color-border)]">
        <Image
          src={project.image}
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
          {project.link && (
            <span className="text-[11px] font-mono text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200 shrink-0">
              {getLinkLabel(project.link)} &rarr;
            </span>
          )}
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
  );

  if (project.link) {
    return (
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block card p-0 overflow-hidden group mb-6"
      >
        {content}
      </a>
    );
  }
  return <div className="card p-0 overflow-hidden mb-6">{content}</div>;
};

const ProjectTile: React.FC<{ project: Project }> = ({ project }) => {
  const body = (
    <>
      <div className="relative aspect-video bg-[var(--color-code-bg)] overflow-hidden border-b border-[var(--color-border)]">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className={`object-cover object-top transition-transform duration-500 ${
            project.link ? 'group-hover:scale-[1.02]' : ''
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
              project.link ? 'group-hover:text-[var(--color-accent)]' : ''
            }`}
          >
            {project.title}
          </h3>
          {project.link && (
            <span className="text-[11px] font-mono text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors duration-200 shrink-0">
              {getLinkLabel(project.link)} &rarr;
            </span>
          )}
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
    </>
  );

  if (project.link) {
    return (
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="card p-0 overflow-hidden group h-full flex flex-col"
      >
        {body}
      </a>
    );
  }
  return <div className="card p-0 overflow-hidden h-full flex flex-col">{body}</div>;
};

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
    </div>
  );
};

export default ProjectsCard;
