"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link?: string;
}

const ProjectsCard: React.FC = () => {
  const [activeProject, setActiveProject] = useState(0);
  
  const projects: Project[] = [
    {
        title: "Threader.cloud",
        description: "My solution to the problem of a lack of branching for conversations with LLMS.",
        technologies: ["React", "Vite.js", "TypeScript", "Tailwind CSS",'OpenAi API'],
        image: "/images/projects/threader.png",
        link: "https://threader.cloud"
      },
    {
        title: "TravelMate",
        description: "Travel Website that use a custom transformer based machine learning model to find crafted travel itiniraries for users based on their mood, when/where and a description of ideal trip.",
        technologies: ["Node.js", "Express", "MongoDB", "React","Tailwind CSS","Python","Flask","Hugging Face"],
        image: "/images/projects/travelmate.png",
      },
    {
      title: "C++ Online fps",
      description: "First person shooter playground game with AI enemy behavior and multiplayer support. Built with OpenGL for rendering and a custom physics engine for collision detection.",
      technologies: ["C++", "OpenGL", "Lua", "GLSL"],
      image: "/images/projects/cpp.png",
      link: "https://github.com/AaronQLF/CppFirstShooter"
    }
  ];

  return (
    <div className="glass-card hover-scale h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-semibold text-black dark:text-white">Featured Projects</h2>
          <div className="flex space-x-2">
            {projects.map((_, index) => (
              <button
                key={index}
                className={`project-dot ${activeProject === index ? 'active' : ''}`}
                onClick={() => setActiveProject(index)}
                aria-label={`View project ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex-grow relative">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className={`project-item absolute inset-0 w-full h-full flex ${
                activeProject === index ? 'project-item-active' : 'project-item-inactive'
              }`}
            >
              <div className="w-1/2 pr-4">
                <h3 className="text-xl font-medium mb-2 dark:text-white">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-white/40 dark:bg-zinc-700/40 backdrop-blur-sm text-xs rounded-full dark:text-zinc-200">{tech}</span>
                  ))}
                </div>
                {project.link && (
                  <a 
                    href={project.link} 
                    className="text-sm font-medium text-black dark:text-white inline-flex items-center hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Project
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                )}
              </div>
              <div className="w-1/2 relative rounded-lg overflow-hidden h-full bg-white/20 dark:bg-zinc-700/20 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Arrow navigation */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100/30 dark:border-zinc-700/30">
          <button 
            onClick={() => setActiveProject((prev) => (prev > 0 ? prev - 1 : projects.length - 1))}
            className="text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Previous project"
          >
            ← Previous
          </button>
          
          <a 
            href="https://github.com/AaronQLF" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            More on GitHub
          </a>
          
          <button 
            onClick={() => setActiveProject((prev) => (prev < projects.length - 1 ? prev + 1 : 0))}
            className="text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Next project"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsCard; 