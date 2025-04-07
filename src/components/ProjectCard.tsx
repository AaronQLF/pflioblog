import React from 'react';
import Link from 'next/link';

interface ProjectCardProps {
  title: string;
  description: string;
  link?: string;
  technologies: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, link, technologies }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech, index) => (
          <span key={index} className="px-2 py-1 bg-slate-100 text-xs rounded-full">{tech}</span>
        ))}
      </div>
      {link && (
        <Link href={link} className="text-sm text-primary font-medium hover:underline">
          View Project →
        </Link>
      )}
    </div>
  );
};

export default ProjectCard; 