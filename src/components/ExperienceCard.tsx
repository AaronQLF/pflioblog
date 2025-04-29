"use client";

import React, { useState, useRef } from 'react';
import TimelineItem from './TimelineItem';

const ExperienceCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Define full experience list
  const experiences = [
    {
      title: "Quantitative Researcher at CDPQ",
      period: "January 2025 - Hybrid - Full time",
      isFirst: true,
      isActive: true
    },
    {
      title: "Quantitative Researcher intern at CDPQ",
      period: "Winter 2024 - Hybrid - Full time",
    },
    {
      title: "Research Assistant at McGill University",
      period: "Summer 2024 - Hybrid - Full time",
    },
    {
      title: "Software Engineer intern at Otera Capital",
      period: "Winter 2023 - Hybrid - Part time",
    },
    {
      title: "Software Engineer intern at Otera Capital",
      period: "Summer 2023 - Hybrid - Full time",
    },
    {
      title: "Full Stack Engineer intern at OneDesk",
      period: "Summer 2022 - Remote - Full time",
      isLast: true
    }
  ];
  
  return (
    <div 
      ref={cardRef}
      className="glass-card hover-scale h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Experience</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">2022—Present</span>
        </div>
        
        <div className="flex-grow overflow-hidden no-scrollbar">
          <div 
            className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              maxHeight: '100%', 
              transform: isHovered ? 'translateX(0)' : 'translateX(5px)',
              opacity: isHovered ? 1 : 0.95,
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {experiences.map((exp, index) => (
              <TimelineItem
                key={index}
                title={exp.title}
                period={exp.period}
                isActive={exp.isActive}
                isFirst={exp.isFirst}
                isLast={exp.isLast}
                expandedByDefault={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;