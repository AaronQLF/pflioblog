"use client";

import React from 'react';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

const ProjectsCard: React.FC = () => {
  const projects: Project[] = [
    {
      title: "Threader.cloud",
      description: "Branching conversations for LLMs — the missing UX pattern for multi-threaded AI dialogue.",
      technologies: ["React", "Vite.js", "TypeScript", "Tailwind CSS", "OpenAI API"],
      link: "https://threader.cloud",
    },
    {
      title: "TravelMate",
      description: "Custom transformer-based model that crafts travel itineraries from mood, timing, and trip descriptions.",
      technologies: ["Node.js", "Express", "MongoDB", "React", "Python", "Flask", "Hugging Face"],
    },
    {
      title: "C++ Online FPS",
      description: "First-person shooter with AI enemy behavior and multiplayer support. Custom physics engine and OpenGL rendering.",
      technologies: ["C++", "OpenGL", "Lua", "GLSL"],
      link: "https://github.com/harounguessous/CppFirstShooter",
    },
  ];

  return (
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">06</span>
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="section-heading mb-0">Projects (mostly old)</h2>
        <a
          href="https://github.com/AaronQLF"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
        >
          GitHub &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="card p-8">
            <h3 className="text-base font-semibold font-sans mb-2">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent)] transition-colors duration-200"
                >
                  {project.title}
                  <span className="text-[var(--color-muted)] text-xs ml-1">&nearr;</span>
                </a>
              ) : (
                project.title
              )}
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {project.technologies.map((tech, i) => (
                <span key={i} className="tag text-[10px]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsCard;
