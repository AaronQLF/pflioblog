"use client";

import React, { useState } from 'react';
import TimelineItem from './TimelineItem';

const ExperienceCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Define full experience list
  const experiences = [
    {
      title: "Software Engineer at CDPQ",
      period: "January 2025 - Hybrid - Full time",
      isFirst: true,
      isActive: true
    },
    {
      title: "Software Engineer intern at CDPQ",
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
      className="experience-card flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700">My Professional Journey</h2>
      </div>
      
      <div className="flex-grow relative overflow-hidden rounded-2xl bg-white">
        <div className={`timeline-container transition-all duration-1000 ease-in-out ${isHovered ? 'max-h-[800px]' : 'max-h-[150px]'}`}>
          {experiences.map((exp, index) => (
            <TimelineItem
              key={index}
              title={exp.title}
              period={exp.period}
              isActive={exp.isActive}
              isFirst={exp.isFirst}
              isLast={exp.isLast}
            />
          ))}
        </div>
        
        {/* Indicator to show there are more items */}
        {!isHovered && (
          <>
            <div className="experience-fade" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 z-10">
              <span className="text-[10px] text-gray-400 transition-opacity duration-500"></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;